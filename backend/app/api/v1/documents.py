import os
import uuid
import json
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import Dict, Any, List

from app.services.document_processor import (
    process_document,
    rebuild_vector_store,
)

from app.services.graph_service import extract_entities

# Set up logging
logger = logging.getLogger("documents_api")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

router = APIRouter(prefix="/documents", tags=["documents"])

# Determine paths relative to the API file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# app/api/v1 is CURRENT_DIR, app/api is parent, app is grandparent, backend is grand-grandparent
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../../"))
UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploads")
METADATA_FILE = os.path.join(UPLOAD_DIR, "documents.json")

# Ensure uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("")
async def list_documents() -> Dict[str, Any]:
    """
    List all uploaded and indexed documents.
    """

    try:

        if not os.path.exists(UPLOAD_DIR):
            return {
                "success": True,
                "count": 0,
                "documents": []
            }

        metadata = {}

        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, "r") as f:
                metadata = json.load(f)

        files = []

        for filename in os.listdir(UPLOAD_DIR):

            if filename == "documents.json":
                continue

            file_path = os.path.join(UPLOAD_DIR, filename)

            if os.path.isfile(file_path):

                file_size = os.path.getsize(file_path)
                _, ext = os.path.splitext(filename)

                info = metadata.get(filename, {})

                files.append({
                    "id": filename,
                    "name": info.get("original_name", filename),
                    "original_name": info.get("original_name", filename),
                    "stored_name": filename,
                    "file_type": ext,
                    "size": file_size,
                    "status": "indexed",
                    "summary": info.get("summary", "")
                })

        return {
            "success": True,
            "count": len(files),
            "documents": files
        }

    except Exception as e:

        logger.exception("Failed to list documents")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Receives an uploaded file, saves it into the backend/uploads directory,
    and forwards it to the document_processor service for automated chunking,
    embedding generation, and FAISS vector database registration.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a valid filename."
        )

    # Clean and parse file extension
    _, extension = os.path.splitext(file.filename)
    extension = extension.lower()

    # Generate a unique stored filename to prevent collisions
    unique_id = uuid.uuid4().hex
    stored_filename = f"{unique_id}{extension}"
    saved_file_path = os.path.join(UPLOAD_DIR, stored_filename)

    logger.info(f"Receiving file: {file.filename} -> Storing as: {stored_filename}")

    try:
        # Write binary stream to secure uploads directory
        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Calculate final stored file size
        file_size = os.path.getsize(saved_file_path)
        logger.info(f"File saved successfully. Size: {file_size} bytes. Initiating document processor...")

        # Process and index the document (Chunking, Embedding & FAISS vectorization)
        indexing_result = process_document(
        saved_file_path,
        original_filename=file.filename
        )

        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, "r") as f:
                metadata = json.load(f)
        else:
            metadata = {}

        metadata[stored_filename] = {
        "original_name": file.filename,
        "stored_name": stored_filename,
        "size": file_size,
        "file_type": extension,
        "summary": indexing_result.get("summary", ""),
        "entities": indexing_result.get("entities", [])
        }

        with open(METADATA_FILE, "w") as f:
            json.dump(metadata, f, indent=4)

        logger.info(f"Document processing completed: {indexing_result}")

        return {
            "success": True,
            "original_name": file.filename,
            "stored_name": stored_filename,
            "file_type": extension,
            "size": file_size,
            "indexing": indexing_result
        }

    except Exception as e:
        logger.exception(f"Failed to process and upload document: {file.filename}")

        # Clean up the file if it was partially written or failed indexing
        if os.path.exists(saved_file_path):
            try:
                os.remove(saved_file_path)
                logger.info(f"Cleaned up failed file upload: {saved_file_path}")
            except Exception as cleanup_err:
                logger.error(f"Failed to clean up file {saved_file_path}: {str(cleanup_err)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest document: {str(e)}"
        )


@router.delete("/{stored_name}")
async def delete_document(stored_name: str) -> Dict[str, Any]:

    target_path = os.path.join(UPLOAD_DIR, stored_name)

    if not os.path.exists(target_path):

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    try:

        os.remove(target_path)

        logger.info("Rebuilding FAISS index after document deletion...")

        rebuild_vector_store(
        upload_dir=UPLOAD_DIR
        )

        if os.path.exists(METADATA_FILE):

            with open(METADATA_FILE, "r") as f:
                metadata = json.load(f)

            metadata.pop(stored_name, None)

            with open(METADATA_FILE, "w") as f:
                json.dump(metadata, f, indent=4)

        logger.info(f"Deleted document: {stored_name}")

        return {
            "success": True,
            "message": "Document deleted successfully."
        }

    except Exception as e:

        logger.exception("Delete failed")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )