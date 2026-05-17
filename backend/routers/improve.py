import json
from typing import Optional
from fastapi.responses import  Response
from fastapi import Body, Depends, HTTPException
from fastapi.routing import APIRouter
from db.supabase_client import get_supabase_client
from core.security import verify_token 
from services.latex_service import generate_pdf_resume

improvement_router = APIRouter()

@improvement_router.post("/fit-resume")
def fit_resume(
    resume_id: str = Body(...),
    analysis_id: str = Body(...),
    template_id: Optional[str] = Body(default=None),
    resume_template: Optional[str] = Body(default=None),
    user=Depends(verify_token)
):
    client = get_supabase_client()
    
    resume = client.table("resumes").select("structured_json, raw_text").eq("id", resume_id).execute()
    analysis = client.table("analyses").select("analysis_json").eq("id", analysis_id).execute()
    
    resume_data = resume.data[0]['structured_json']
    resume_raw_text = resume.data[0].get('raw_text', '')
    analysis_data = analysis.data[0]['analysis_json']

    selected_template = template_id or resume_template
    if not selected_template:
        raise HTTPException(status_code=400, detail="Either template_id or resume_template must be provided")
    
    pdf_bytes = generate_pdf_resume(
        resume_data=json.dumps(resume_data, ensure_ascii=False),
        analysis_data=json.dumps(analysis_data, ensure_ascii=False),
        resume_template=selected_template,
        resume_raw_text=str(resume_raw_text),
    )
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=improved_resume.pdf"}
    )
