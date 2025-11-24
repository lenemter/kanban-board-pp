from datetime import date, datetime
import enum

from pydantic import BaseModel, Field

from .task_tag import TaskTagPublic


class Priority(int, enum.Enum):
    low = 1
    medium = 2
    high = 3


class TaskPublic(BaseModel):
    id: int
    position: float
    title: str
    description: str | None
    priority: Priority | None
    assignee_id: int | None
    due_date: date | None
    created_at: datetime
    author: int
    tags: list[TaskTagPublic]


class TaskCreate(BaseModel):
    title: str
    description: str | None
    priority: Priority | None
    assignee_id: int | None
    due_date: date | None


class TaskUpdate(BaseModel):
    title: str = Field(default=...)
    description: str | None = Field(default=...)
    priority: Priority | None = Field(default=...)
    assignee_id: int | None = Field(default=...)
    due_date: date | None = Field(default=...)


class MoveTaskPayload(BaseModel):
    new_column_id: int
    before_id: int | None = None
    after_id: int | None = None
