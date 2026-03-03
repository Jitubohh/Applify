# Resume management routes
from fastapi import APIRouter, Depends, UploadFile
from core.security import verify_token
from services.resume_service import process_resume

resume_router = APIRouter()

@resume_router.post("/upload")
def upload_resume(file: UploadFile, user = Depends(verify_token)):
    result = process_resume(file, user["sub"])
    return result
