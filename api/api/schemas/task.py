from datetime import datetime
import enum

from pydantic import BaseModel

from .task_tag import TaskTagPublic
from .unset_type import Unset, UnsetType


class Priority(int, enum.Enum):
    low = 1
    medium = 2
    high = 3


class TaskPublic(BaseModel):
    id: int
    position: int
    title: str
    description: str | None
    priority: Priority | None
    assignee_id: int | None
    created_at: datetime
    author: int
    tags: list[TaskTagPublic]


class TaskCreate(BaseModel):
    title: str
    description: str | None
    priority: Priority | None
    assignee_id: int | None


class TaskUpdate(BaseModel):
    column_id: UnsetType | int = Unset
    position: UnsetType | int = Unset
    title: UnsetType | str = Unset
    description: UnsetType | str | None = Unset
    priority: UnsetType | Priority | None = Unset
    assignee_id: UnsetType | int | None = Unset
