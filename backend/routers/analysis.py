# Analysis routes
from fastapi import APIRouter, Depends, Body
from core.security import verify_token
from services.analysis_service import create_analysis
from db.supabase_client import get_supabase_client

analysis_router = APIRouter()

@analysis_router.post("/submit")
def submit_analysis(job_description: str = Body(...), job_title: str = Body(...), resume_id: str = Body(...), user = Depends(verify_token)):
    result = create_analysis(user["sub"], resume_id, job_description, job_title)
    return result

@analysis_router.get("/my-analyses")
def get_analyses(user = Depends(verify_token)):
    client = get_supabase_client()
    result = client.table("analyses").select("id, resume_id, job_description, created_at, analysis_json").eq("user_id", user["sub"]).execute()
    return result