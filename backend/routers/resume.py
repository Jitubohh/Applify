# Resume management routes
from fastapi import APIRouter, Depends, UploadFile
from core.security import verify_token
from services.resume_service import process_resume
from db.supabase_client import get_supabase_client

resume_router = APIRouter()

@resume_router.post("/upload")
def upload_resume(file: UploadFile, user = Depends(verify_token)):
    result = process_resume(file, user["sub"])
    return result

@resume_router.get("/my-resumes")
def get_my_resumes(user=Depends(verify_token)):
    client = get_supabase_client()
    result = client.table("resumes").select("id, pdf_path, created_at").eq("user_id", user["sub"]).execute()
    return result
