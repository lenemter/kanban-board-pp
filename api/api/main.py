import dotenv
from fastapi import FastAPI

import api.routers
import api.db

dotenv.load_dotenv()

api.db.create_db_and_tables()

app = FastAPI()
app.include_router(api.routers.auth_router)
