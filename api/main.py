import dotenv
from fastapi import FastAPI

import api.db
import api.routers
import api.utils

dotenv.load_dotenv()

api.db.create_db_and_tables()

app = FastAPI()
app.include_router(api.routers.auth_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.users_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.boards_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.tags_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.columns_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.tasks_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.task_comments_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.subtasks_router, prefix=api.utils.PREFIX)
