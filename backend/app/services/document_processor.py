import os
import logging
from typing import Dict, Any, List

from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

# Set up logger
logger = logging.getLogger("document_processor")
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


def load_document(file_path: str) -> List[Document]:
    """
    Loads document content based on its file extension.
    Supported types: PDF (PyPDFLoader), DOCX (Docx2txtLoader), TXT (standard reading)
    """
    if not os.path.exists(file_path):
        logger.error(f"Target file not found: {file_path}")
        raise FileNotFoundError(f"The file at '{file_path}' does not exist.")

    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    logger.info(f"Loading document '{file_path}' with extension '{ext}'")

    try:
        if ext == ".pdf":
            loader = PyPDFLoader(file_path)
            docs = loader.load()

            for doc in docs:
                text = doc.page_content

        # normalize line endings
                text = text.replace("\r", "\n")

        # join words split by a newline
                text = text.replace("-\n", "")
                text = text.replace("\n", " ")

        # collapse multiple spaces
                text = " ".join(text.split())

                doc.page_content = text

            return docs
        elif ext == ".docx":
            loader = Docx2txtLoader(file_path)
            return loader.load()
        elif ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            return [Document(page_content=content, metadata={"source": file_path})]
        else:
            logger.warning(f"Unsupported file extension '{ext}' for file: {file_path}. Fallback to standard reading.")
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            return [Document(page_content=content, metadata={"source": file_path})]
    except Exception as e:
        logger.exception(f"Error occurred while loading file {file_path}")
        raise RuntimeError(f"Error loading file content: {str(e)}") from e


def process_document(
    file_path: str,
    original_filename: str = None,
    vector_store_dir: str = DEFAULT_VECTOR_STORE_DIR
) -> Dict[str, Any]:
    """
    Processes the document at the specified file path by:
    1. Parsing content according to file type (PDF, DOCX, TXT).
    2. Splitting documents into small semantic chunks using RecursiveCharacterTextSplitter.
    3. Generating vectors using HuggingFaceEmbeddings ("sentence-transformers/all-MiniLM-L6-v2").
    4. Saving or appending chunk vectors to a local FAISS index under `backend/vector_store/`.

    Returns a status dictionary with chunk metadata.
    """
    try:
        # Load raw content as LangChain Documents
        raw_docs = load_document(file_path)
        if not raw_docs:
            logger.warning(f"Document loaded but returned empty content: {file_path}")
            return {
                "status": "empty",
                "chunks": 0
            }

        # Split document text into modular chunks
        logger.info("Splitting loaded document content into chunks...")
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )

        chunks = splitter.split_documents(raw_docs)
        chunk_count = len(chunks)
        logger.info(f"Finished splitting. Created {chunk_count} chunk(s).")

        if chunk_count == 0:
            logger.warning(f"Document content produced 0 split chunks: {file_path}")
            return {
                "status": "empty",
                "chunks": 0
            }

        # Initialize the embedding model
        logger.info("Loading HuggingFace embeddings model (sentence-transformers/all-MiniLM-L6-v2)...")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        logger.info(f"Targeting FAISS directory: {vector_store_dir}")

        os.makedirs(vector_store_dir, exist_ok=True)

        index_file = os.path.join(vector_store_dir, "index.faiss")

        if os.path.exists(index_file):

            logger.info("Existing FAISS index detected. Loading...")

            db = FAISS.load_local(
                vector_store_dir,
                embeddings,
                allow_dangerous_deserialization=True
            )

            logger.info(f"Appending {len(chunks)} new chunks...")

            db.add_documents(chunks)

        else:

            logger.info("No existing FAISS index found. Creating a new one...")

            db = FAISS.from_documents(chunks, embeddings)

        logger.info("Saving FAISS index...")

        db.save_local(vector_store_dir)

        logger.info("FAISS saved successfully.")

        return {
            "status": "indexed",
            "chunks": chunk_count
        }

    except Exception as e:
        logger.exception(f"Failed to process and index document {file_path}")
        raise RuntimeError(f"Document processing exception: {str(e)}") from e
    
def rebuild_vector_store(upload_dir: str, vector_store_dir: str = DEFAULT_VECTOR_STORE_DIR):
    """
    Rebuild the FAISS vector database using every document
    currently present inside uploads/.
    """

    logger.info("Starting complete FAISS rebuild...")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    all_chunks = []

    for filename in os.listdir(upload_dir):

        if filename == "documents.json":
            continue

        file_path = os.path.join(upload_dir, filename)

        if not os.path.isfile(file_path):
            continue

        logger.info(f"Processing: {filename}")

        docs = load_document(file_path)

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )

        chunks = splitter.split_documents(docs)

        all_chunks.extend(chunks)

    if len(all_chunks) == 0:

        logger.warning("No documents remaining. Removing FAISS index.")

        index_file = os.path.join(vector_store_dir, "index.faiss")
        pkl_file = os.path.join(vector_store_dir, "index.pkl")

        if os.path.exists(index_file):
            os.remove(index_file)

        if os.path.exists(pkl_file):
            os.remove(pkl_file)

        return

    logger.info(f"Creating new FAISS index with {len(all_chunks)} chunks...")

    db = FAISS.from_documents(all_chunks, embeddings)

    db.save_local(vector_store_dir)

    logger.info("FAISS rebuild completed successfully.")