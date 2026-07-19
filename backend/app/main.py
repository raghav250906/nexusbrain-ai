from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router

app = FastAPI(
    title="NexusBrain AI",
    description="AI Operating System for Industrial Knowledge & Operations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Welcome to NexusBrain AI",
        "status": "Backend Running Successfully 🚀",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }