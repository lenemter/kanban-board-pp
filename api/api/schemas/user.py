from typing import Any, Union
from pydantic import BaseModel, EmailStr
import pydantic
import pydantic_core

from .unset_type import Unset, UnsetType


class PasswordStr:
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: pydantic.GetCoreSchemaHandler
    ) -> pydantic_core.core_schema.CoreSchema:
        return pydantic_core.core_schema.no_info_plain_validator_function(cls._validate)

    @classmethod
    def _validate(cls, value: Any) -> Union[str, None]:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("Failed to parse password")
        if len(value) < 8:
            raise ValueError("Password is too weak: it must be at least 8 symbols long")

        return value

    def __init__(self, internal_string: str) -> None:
        self.internal_string = internal_string


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    is_verified: bool


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: PasswordStr


class UserUpdate(BaseModel):
    email: UnsetType | EmailStr = Unset
    password: UnsetType | PasswordStr = Unset
