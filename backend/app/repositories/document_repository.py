from sqlalchemy.orm import Session

from app.models.document import Document
from app.schemas.document import DocumentCreate


class DocumentRepository:

    @staticmethod
    def create(db: Session, document: DocumentCreate):
        db_document = Document(
            filename=document.filename,
            file_type=document.file_type,
            content=document.content,
        )

        db.add(db_document)
        db.commit()
        db.refresh(db_document)

        return db_document

    @staticmethod
    def get_all(db: Session):
        return db.query(Document).order_by(Document.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, document_id: int):
        return (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )