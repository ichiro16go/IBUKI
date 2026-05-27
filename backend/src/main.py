import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

load_dotenv()

from src.dependencies import limiter  # noqa: E402
from src.routers.hobby import router as hobby_router  # noqa: E402

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Ibuki Backend", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


def _get_cors_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "")
    return [o.strip() for o in raw.split(",") if o.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
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
