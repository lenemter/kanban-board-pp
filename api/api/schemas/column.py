from pydantic import BaseModel

from .unset_type import Unset, UnsetType


class ColumnPublic(BaseModel):
    id: int
    position: float
    name: str
    tasks_limit: int | None


class ColumnCreate(BaseModel):
    name: str


class ColumnUpdate(BaseModel):
    name: UnsetType | str = Unset
    tasks_limit: UnsetType | int | None = Unset


class MoveColumnPayload(BaseModel):
    before_id: int | None = None
    after_id: int | None = None
