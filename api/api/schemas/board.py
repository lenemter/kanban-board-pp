from pydantic import BaseModel

from .unset_type import Unset, UnsetType


class BoardPublic(BaseModel):
    id: int
    name: str
    owner_id: int
    is_public: bool


class BoardCreate(BaseModel):
    name: str


class BoardUpdate(BaseModel):
    name: UnsetType | str = Unset
    is_public: UnsetType | str = Unset
