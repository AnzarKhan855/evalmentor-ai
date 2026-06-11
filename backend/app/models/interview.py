from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Interview(BaseModel):
    user_id: str
    question: str
    answer: str
    evaluation: str
    score: Optional[int] = None
    created_at: datetime = datetime.utcnow()