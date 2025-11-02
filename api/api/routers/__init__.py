from .auth import router as auth_router
from .users import router as users_router
from .boards import router as boards_router
from .columns import router as columns_router
from .tasks import router as tasks_router
from .task_comments import router as task_comments_router
from .subtasks import router as subtasks_router

__all__ = [
    "auth_router", "users_router", "boards_router", "columns_router",
    "tasks_router", "task_comments_router", "subtasks_router",
]
