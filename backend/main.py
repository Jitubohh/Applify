from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import auth_router
from routers.resume import resume_router
from routers.analysis import analysis_router
from routers.improve import improvement_router

app = FastAPI(
    title="Applify API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(resume_router, prefix="/resume")
app.include_router(analysis_router, prefix="/analysis")
app.include_router(improvement_router, prefix="/upgrade")

@app.get("/")
def root():
    return {"message": "API running"}