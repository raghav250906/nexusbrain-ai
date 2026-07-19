from fastapi import APIRouter

from app.api.v1.documents import router as document_router
from app.api.v1.query import router as query_router

api_router = APIRouter()

api_router.include_router(document_router)
api_router.include_router(query_router)