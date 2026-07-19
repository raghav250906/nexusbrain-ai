import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.query_service import search_documents
from app.services.gemini_service import generate_answer

# Set up logger
logger = logging.getLogger("query_api")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

router = APIRouter(
    prefix="/query",
    tags=["AI Query"]
)

class QueryRequest(BaseModel):
    question: str = Field(
        ...,
        description="The semantic search query question."
    )

    history: list = Field(
        default_factory=list,
        description="Previous conversation history."
    )


@router.post("", status_code=status.HTTP_200_OK)
async def query_knowledge_base(request: QueryRequest):
    """
    Handles similarity search requests against the vector database knowledge base.
    Validates the query, executes the search service, and handles errors gracefully.
    """
    # Validate empty questions
    question = request.question.strip()
    if not question:
        logger.warning("Empty search query received.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The search question cannot be empty or consist solely of whitespace."
        )

    logger.info(f"Received query request: '{question}'")

    try:
        # Call the query service
        result = search_documents(
        query=question,
        history=request.history
        )
        
        # If search service returns success=False, return HTTP 400 Bad Request
        if not result.get("success", False):
            logger.error(f"Search query execution returned failure: {result.get('message')}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("message", "Vector database query execution failed.")
            )

        logger.info(f"Query executed successfully for: '{question}'")

        return {
            "success": True,
            "question": question,
            "answer": result["answer"],
            "sources": result.get("sources", [])
        }

    except HTTPException as he:
        # Re-raise HTTPExceptions to avoid wrapping them under 500
        raise he
    except Exception as e:
        logger.exception(f"Unexpected exception occurred while querying knowledge base for: '{question}'")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred during the query: {str(e)}"
        )