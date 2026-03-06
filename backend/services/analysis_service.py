from db.supabase_client import get_supabase_client
from services.rag_service import run_analysis

def create_analysis(user_id: str, resume_id: str, job_description: str):
    client = get_supabase_client()
    resume_data = client.table("resumes").select("structured_json").eq("id", resume_id).execute()
    analysis = run_analysis(resume_data.data[0]['structured_json'], job_description).model_dump()


    result = client.table("analyses").insert({
        "user_id": user_id,
        "resume_id": resume_id,
        "job_description": job_description,
        "analysis_json": analysis
    }).execute()

    return result