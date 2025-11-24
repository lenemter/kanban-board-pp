from datetime import datetime

from pydantic import BaseModel


class TaskCommentPublic(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: int | None


class TaskCommentCreate(BaseModel):
    content: str


class TaskCommentUpdate(BaseModel):
    content: str
