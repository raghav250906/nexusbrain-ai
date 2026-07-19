from app.services.gemini_service import generate_answer
import os
import json
import logging
from typing import Dict, Any, List

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Set up logger
logger = logging.getLogger("query_service")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Determine path for backend/vector_store relative to this service file location
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# current dir is: backend/app/services
# app dir is: backend/app
APP_DIR = os.path.dirname(CURRENT_DIR)
# backend dir is: backend
BACKEND_DIR = os.path.dirname(APP_DIR)
DEFAULT_VECTOR_STORE_DIR = os.path.join(BACKEND_DIR, "vector_store")

UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploads")
METADATA_FILE = os.path.join(UPLOAD_DIR, "documents.json")


def search_documents(
    query: str,
    k: int = 5,
    vector_store_dir: str = DEFAULT_VECTOR_STORE_DIR
) -> Dict[str, Any]:
    """
    Loads the existing FAISS database index and performs a similarity search
    for the provided query, retrieving the top k matching document chunks.

    Args:
        query: The semantic search query string.
        k: The number of nearest matches to retrieve (defaults to 5).
        vector_store_dir: Path to the FAISS directory.

    Returns:
        A dictionary indicating search success status, original query, and a list
        of results containing page content, metadata, and distance scores.
    """
    logger.info(f"Initiating document similarity search for query: '{query}' with k={k}")

    # Check if vector database exists
    index_file_path = os.path.join(vector_store_dir, "index.faiss")
    if not os.path.exists(index_file_path):
        logger.warning(f"FAISS database not found at '{index_file_path}'")
        return {
            "success": False,
            "message": "Vector database not initialized."
        }

    try:
        # Load HuggingFace embeddings model
        logger.info("Loading HuggingFace embeddings model (sentence-transformers/all-MiniLM-L6-v2)...")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        # Load existing FAISS index safely
        logger.info(f"Loading local FAISS database from {vector_store_dir}...")
        db = FAISS.load_local(
            folder_path=vector_store_dir,
            embeddings=embeddings,
            allow_dangerous_deserialization=True
        )

        # Execute similarity search with distance score (L2 distance metric)
        logger.info("Executing similarity search on FAISS database index...")
        matches = db.max_marginal_relevance_search(
            query,
            k=5,
            fetch_k=20
        )

        # Build production-ready results payload
        results = []
        seen_sources = set()

        for doc in matches:

            source_path = doc.metadata.get("source", "")

            # Show only the filename instead of the full path
            filename = os.path.basename(source_path)

            results.append({
                "content": doc.page_content,
                "metadata": {
                    **doc.metadata,
                    "source": filename
                },
                "score": None
            })

        print("=" * 80)
        print("RETRIEVED DOCUMENTS")

        for i, item in enumerate(results, 1):
            print(f"\n----- Chunk {i} -----")
            print(item["content"][:400])

        print("=" * 80)

        logger.info(f"Similarity search successful. Found {len(results)} matches.")

        context = "\n\n".join(
            [item["content"] for item in results]
        )

        print("=" * 80)
        print("CONTEXT SENT TO GEMINI")
        print(context)
        print("=" * 80)

        answer = generate_answer(
            question=query,
            context=context
        )

        # Load filename mapping
        metadata = {}

        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, "r") as f:
                metadata = json.load(f)

        unique_sources = []
        seen = set()

        for item in results:
            stored_name = os.path.basename(item["metadata"]["source"])

            original_name = metadata.get(
                stored_name,
                {}
            ).get(
                "original_name",
                stored_name
            )

            if original_name not in seen:
                seen.add(original_name)
                unique_sources.append(original_name)

        return {
            "success": True,
            "question": query,
            "answer": answer,
            "sources": unique_sources
        }

    except Exception as e:
        logger.exception(f"Exception encountered during similarity search execution for query: '{query}'")
        return {
            "success": False,
            "message": f"Search failed due to internal exception: {str(e)}"
        }