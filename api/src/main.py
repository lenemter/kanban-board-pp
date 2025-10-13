import dotenv
from fastapi import FastAPI


dotenv.load_dotenv()

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
