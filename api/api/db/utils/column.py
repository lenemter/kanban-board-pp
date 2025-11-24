from typing import TYPE_CHECKING

from sqlalchemy import func
from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Board, Column


def get_column_by_id(session: Session, column_id: int) -> Column | None:
    from .. import Column

    return session.get(Column, column_id)


def get_columns(session: Session, board: Board) -> list[Column]:
    from .. import Column

    return list(
        session.exec(
            select(Column).where(
                Column.board_id == board.id
            )
        ).all()
    )


def get_n_columns(session: Session, board: Board) -> int:
    from .. import Column

    return session.exec(select(func.count()).select_from(Column).where(Column.board_id == board.id)).one()


def create_column(session: Session, board: Board, **kwargs) -> Column:
    from .. import Column

    assert board.id is not None

    new_column = Column(board_id=board.id, position=get_n_columns(session, board), **kwargs)
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


def update_board(session: Session, board: Board, **kwargs) -> Board:
    board.sqlmodel_update(kwargs)
    session.add(board)
    session.commit()
    session.refresh(board)

    return board


def move_column(session: Session, column: Column, before: Column | None, after: Column | None) -> Column:
    if before and after:
        # между двумя колонками
        new_position = (before.position + after.position) / 2
    elif before:
        # вставить после колонки `before`
        new_position = before.position + 1
    elif after:
        # вставить перед колонкой `after`
        new_position = after.position - 1
    else:
        # колонок нет, вставляем первой
        new_position = 0

    column.position = new_position

    session.add(column)
    session.commit()
    session.refresh(column)

    return column
