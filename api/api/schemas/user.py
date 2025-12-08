import enum
from typing import Any, Union
from pydantic import BaseModel, EmailStr
import pydantic
import pydantic_core

from .unset_type import Unset, UnsetType


class PasswordStr(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: pydantic.GetCoreSchemaHandler
    ) -> pydantic_core.core_schema.CoreSchema:
        return pydantic_core.core_schema.no_info_plain_validator_function(cls._validate)

    @classmethod
    def __get_pydantic_json_schema__(
        cls,
        _core_schema: pydantic_core.core_schema.CoreSchema,
        handler: pydantic.GetJsonSchemaHandler
    ) -> pydantic.json_schema.JsonSchemaValue:
        return handler(pydantic_core.core_schema.str_schema())

    @classmethod
    def _validate(cls, value: Any) -> Union[str, None]:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("Failed to parse password")
        if len(value) < 8:
            raise ValueError("Password is too weak: it must be at least 8 symbols long")

        return value


class Theme(int, enum.Enum):
    light = 1
    dark = 2
    purple = 3
    amoled = 4
    mint = 5


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    name: str
    is_verified: bool
    theme: Theme


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: PasswordStr


class UserUpdate(BaseModel):
    email: UnsetType | EmailStr = Unset
    name: UnsetType | str = Unset
    password: UnsetType | PasswordStr = Unset
    theme: UnsetType | Theme = Unset
