from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "NexusBrain AI"
    APP_VERSION: str = "1.0.0"

    DEBUG: bool = True

    API_V1_PREFIX: str = "/api/v1"

    SECRET_KEY: str

    DATABASE_URL: str

    CORS_ORIGINS: str

    QDRANT_URL: str = ""

    NEO4J_URI: str = ""

    NEO4J_USERNAME: str = ""

    NEO4J_PASSWORD: str = ""

    GOOGLE_API_KEY: str = ""

    SUPABASE_URL: str = ""

    SUPABASE_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()