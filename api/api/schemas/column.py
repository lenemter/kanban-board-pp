from pydantic import BaseModel

from .unset_type import Unset, UnsetType


class ColumnPublic(BaseModel):
    id: int
    position: int
    name: str
    tasks_limit: int | None


class ColumnCreate(BaseModel):
    name: str


class ColumnUpdate(BaseModel):
    position: UnsetType | int = Unset
    name: UnsetType | str = Unset
    tasks_limit: UnsetType | int | None = Unset
