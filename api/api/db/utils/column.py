from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Board, Column


def get_column_by_id(column_id: int) -> Column | None:
    from .. import engine, Column

    with Session(engine) as session:
        return session.get(Column, column_id)


def get_columns(board: Board) -> list[Column]:
    from .. import engine, Column

    with Session(engine) as session:
        return list(
            session.exec(
                select(Column).where(
                    Column.board_id == board.id
                )
            ).all()
        )


def create_column(board: Board, **kwargs) -> Column:
    from .. import engine, Column

    assert board.id is not None

    with Session(engine) as session:
        new_column = Column(board_id=board.id, position=len(get_columns(board)), **kwargs)
        session.add(new_column)
        session.commit()
        session.refresh(new_column)

        return new_column


def update_column(session: Session, column: Column, **kwargs) -> Column:
    column.sqlmodel_update(kwargs)
    session.add(column)
    session.commit()
    session.refresh(column)

    return column
