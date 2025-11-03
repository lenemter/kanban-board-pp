from datetime import datetime

from pydantic import BaseModel

from .task_tag import TaskTagPublic
from .unset_type import Unset, UnsetType


class TaskPublic(BaseModel):
    id: int
    position: int
    title: str
    description: str | None
    assignee_id: int | None
    created_at: datetime
    author: int
    tags: list[TaskTagPublic]


class TaskCreate(BaseModel):
    title: str
    description: str | None
    assignee_id: int | None


class TaskUpdate(BaseModel):
    column_id: UnsetType | int = Unset
    position: UnsetType | int = Unset
    title: UnsetType | str = Unset
    description: UnsetType | str | None = Unset
    assignee_id: UnsetType | int | None = Unset
