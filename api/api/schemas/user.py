from pydantic import BaseModel

from .unset_type import Unset, UnsetType


class UserPublic(BaseModel):
    id: int
    email: str
    is_verified: bool


class UserCreate(BaseModel):
    email: str
    name: str
    password: str


class UserUpdate(BaseModel):
    email: UnsetType | str = Unset
    password: UnsetType | str = Unset
