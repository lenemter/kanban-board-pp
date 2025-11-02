from datetime import datetime

from pydantic import BaseModel

from .unset_type import Unset, UnsetType


class SubtaskPublic(BaseModel):
    id: int
    is_done: bool
    title: str
    created_at: datetime


class SubtaskCreate(BaseModel):
    title: str


class SubtaskUpdate(BaseModel):
    is_done: UnsetType | str = Unset
    title: UnsetType | str = Unset
