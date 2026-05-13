import os
from fastapi.responses import  Response
from fastapi import Body, Depends
from fastapi.routing import APIRouter
from db.supabase_client import get_supabase_client
from core.security import verify_token 
from services.latex_service import generate_pdf_resume

improvement_router = APIRouter()

@improvement_router.post("/fit-resume")
def fit_resume(resume_id: str = Body(...), analysis_id: str = Body(...), resume_template: str = Body(...), user=Depends(verify_token)):
    client = get_supabase_client()
    
    # Fetch resume structured data
    resume = client.table("resumes").select("structured_json").eq("id", resume_id).execute()
    
    # Fetch analysis data
    analysis = client.table("analyses").select("analysis_json").eq("id", analysis_id).execute()
    
    resume_data = resume.data[0]['structured_json']
    analysis_data = analysis.data[0]['analysis_json']
    
    # Generate and compile PDF
    template_path = os.path.join(os.path.dirname(__file__), f"../services/templates/{resume_template}.tex")
    with open(template_path, "r") as f:
        resume_template = f.read()
    
    pdf_bytes = generate_pdf_resume(str(resume_data), str(analysis_data), resume_template)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=fitted_resume.pdf"}
    )