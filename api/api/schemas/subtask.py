from datetime import datetime

from pydantic import BaseModel, Field


class SubtaskPublic(BaseModel):
    id: int
    is_done: bool
    title: str
    created_at: datetime


class SubtaskCreate(BaseModel):
    title: str


class SubtaskUpdate(BaseModel):
    is_done: bool = Field(default=...)
    title: str = Field(default=...)
