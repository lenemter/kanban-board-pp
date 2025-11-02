import typing
from sqlmodel import Field, SQLModel


class BaseUser(SQLModel):
    username: str = Field(unique=True)
    name: str = Field()
    hashed_password: str = Field()


class UserDB(BaseUser, table=True):
    # All of this just to satisfy Mypy...
    __tablename__: typing.ClassVar[  # pyright: ignore
        typing.Union[str, typing.Callable[..., str]]
    ] = "user"

    id: int | None = Field(default=None, primary_key=True)


class User(BaseUser):
    id: int
