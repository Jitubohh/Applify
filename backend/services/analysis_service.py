from db.supabase_client import get_supabase_client


def create_analysis(user_id: str, resume_id: str, job_description: str):
    client = get_supabase_client()

    result = client.table("analyses").insert({
        "user_id": user_id,
        "resume_id": resume_id,
        "job_description": job_description
    }).execute()

    return result