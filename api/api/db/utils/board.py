from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Board,  BoardDB, User


def _get_board_db_by_id(session: Session, board_id: int) -> BoardDB:
    board_db = session.get(BoardDB, board_id)
    if (board_db is None):
        raise ValueError(f"Board with id {board_id} not found")

    return board_db


def get_owned_boards(user_id: int | None) -> list[Board]:
    from .. import engine, Board

    with Session(engine) as session:
        return list(
            session.exec(
                select(Board).where(
                    Board.owner_id == user_id
                )
            ).all()
        )


def create_board(owner: User, **kwargs) -> Board:
    from .. import engine, Board, BoardDB

    with Session(engine) as session:
        new_board = BoardDB(owner_id=owner.id, **kwargs)
        session.add(new_board)
        session.commit()
        session.refresh(new_board)

        return Board.model_validate(new_board)


def update_board(session: Session, board: Board, **kwargs) -> Board:
    board_db = _get_board_db_by_id(session, board.id)
    board_db.sqlmodel_update(kwargs)
    session.add(board_db)
    session.commit()
    session.refresh(board_db)

    return Board.model_validate(board_db)


def delete_board(session: Session, board: Board) -> None:
    board_db = _get_board_db_by_id(session, board.id)
    session.delete(board_db)
    session.commit()
