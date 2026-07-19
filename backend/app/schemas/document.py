from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    filename: str
    file_type: str


class DocumentCreate(DocumentBase):
    content: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: int
    content: Optional[str]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)