# Main entry point for Applify backend
from fastapi import FastAPI
from routers.auth import router

app = FastAPI(
    title = "Applify API",
    version = "1.0.0"
)

app.include_router(router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "API running"}
