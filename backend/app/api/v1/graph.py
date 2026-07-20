from fastapi import APIRouter
from app.services.graph_service import build_graph

router = APIRouter(
    prefix="/graph",
    tags=["Knowledge Graph"]
)

@router.get("")
async def get_graph():
    return build_graph()