# Main entry point for Applify backend
from fastapi import FastAPI

app = FastAPI(
    title = "Applify API",
    version = "1.0.0"
)

@app.get("/")
def root():
    return {"message": "API running"}
