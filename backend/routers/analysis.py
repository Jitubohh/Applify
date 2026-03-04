# Analysis routes
from fastapi import APIRouter, Depends, Body
from core.security import verify_token
from services.analysis_service import create_analysis

analysis_router = APIRouter()

@analysis_router.post("/submit")
def submit_analysis(job_description: str = Body(...), resume_id: str = Body(...), user = Depends(verify_token)):
    result = create_analysis(user["sub"], resume_id, job_description)
    return result