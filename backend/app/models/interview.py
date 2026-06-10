from pydantic import BaseModel
from typing import Optional


class Interview(BaseModel):
    user_id: str
    question: str
    answer: str
    evaluation: str