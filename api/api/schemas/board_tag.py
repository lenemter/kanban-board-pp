from pydantic import BaseModel

from .unset_type import Unset, UnsetType


class BoardTagPublic(BaseModel):
    id: int
    name: str
    color: str


class BoardTagCreate(BaseModel):
    name: str
    color: str


class BoardTagUpdate(BaseModel):
    name: UnsetType | str = Unset
    color: UnsetType | str = Unset
