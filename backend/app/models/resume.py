from pydantic import BaseModel, Field
from datetime import datetime


class ResumeModel(BaseModel):
    user_id: str
    filename: str
    original_filename: str
    file_path: str
    content_type: str
    file_size: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)