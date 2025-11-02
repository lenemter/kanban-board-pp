import typing
from sqlmodel import Field, SQLModel


class BaseBoard(SQLModel):
    owner_id: int = Field(foreign_key="user.id")
    name: str = Field()


class BoardDB(BaseBoard, table=True):
    # All of this just to satisfy Mypy...
    __tablename__: typing.ClassVar[  # pyright: ignore
        typing.Union[str, typing.Callable[..., str]]
    ] = "board"

    id: int | None = Field(default=None, primary_key=True)


class Board(BaseBoard):
    id: int
