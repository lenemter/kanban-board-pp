from datetime import datetime

from pydantic import BaseModel

from .unset_type import Unset, UnsetType


class TaskCommentPublic(BaseModel):
    id: int
    content: str
    created_at: datetime
    created_by: int | None


class TaskCommentCreate(BaseModel):
    content: str


class TaskCommentUpdate(BaseModel):
    content: UnsetType | str = Unset
