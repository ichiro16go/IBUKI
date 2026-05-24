from fastapi import FastAPI

app = FastAPI(title="Ibuki Backend", version="0.1.0")


@app.get("/")
async def read_root() -> dict[str, str]:
    return {"message": "Welcome to the Ibuki Backend"}


@app.get("/health")
async def read_health() -> dict[str, str]:
    return {"status": "ok"}
