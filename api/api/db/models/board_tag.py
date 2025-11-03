from sqlmodel import Field, SQLModel


class BoardTag(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="board.id", ondelete="CASCADE")
    name: str = Field()
    color: str = Field()
