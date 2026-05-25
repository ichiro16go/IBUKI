import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from src.routers.hobby import router as hobby_router  # noqa: E402

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Ibuki Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: tighten to known origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hobby_router)


@app.get("/")
async def read_root() -> dict[str, str]:
    return {"message": "Welcome to the Ibuki Backend"}


@app.get("/health")
async def read_health() -> dict[str, str]:
    return {"status": "ok"}
