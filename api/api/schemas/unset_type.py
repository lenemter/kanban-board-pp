from typing import Any, Union

import pydantic
import pydantic_core


class UnsetType:
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: pydantic.GetCoreSchemaHandler
    ) -> pydantic_core.core_schema.CoreSchema:
        return pydantic_core.core_schema.no_info_plain_validator_function(cls._validate)

    @classmethod
    def _validate(cls, value: Any) -> Union["UnsetType", None]:
        if value is None:
            return None
        if isinstance(value, UnsetType):
            return value
        raise ValueError("This field must be Unset")


Unset = UnsetType()
