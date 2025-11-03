from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Board, User


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


def get_shared_boards(user_id: int | None) -> list[Board]:
    from .. import engine, Board, BoardUserAccess

    with Session(engine) as session:
        shared = list(
            session.exec(
                select(Board)
                .join(BoardUserAccess)
                .where(BoardUserAccess.user_id == user_id)
            ).all()
        )

        return get_owned_boards(user_id) + shared


def create_board(owner: User, **kwargs) -> Board:
    from .. import engine, Board

    assert owner.id is not None

    with Session(engine) as session:
        new_board = Board(owner_id=owner.id, **kwargs)
        session.add(new_board)
        session.commit()
        session.refresh(new_board)

        return new_board


def update_board(session: Session, board: Board, **kwargs) -> Board:
    board.sqlmodel_update(kwargs)
    session.add(board)
    session.commit()
    session.refresh(board)

    return board
