import dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import api.db
import api.routers
import api.utils

dotenv.load_dotenv()

api.db.create_db_and_tables()

origins = [
    "http://localhost:8000",
    "http://localhost:5173",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.routers.auth_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.users_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.boards_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.tags_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.columns_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.tasks_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.task_comments_router, prefix=api.utils.PREFIX)
app.include_router(api.routers.subtasks_router, prefix=api.utils.PREFIX)
# вроде нормально