# Main entry point for Applify backend
from fastapi import FastAPI
from routers.auth import auth_router
from routers.resume import resume_router

app = FastAPI(
    title = "Applify API",
    version = "1.0.0"
)

app.include_router(auth_router, prefix="/auth")

app.include_router(resume_router, prefix="/resume")

@app.get("/")
def root():
    return {"message": "API running"}

