from db.supabase_client import get_supabase_client
from services.pdf_service import extract_text_from_pdf
from fastapi import UploadFile

def process_resume(file: UploadFile, user_id: str):
    text = extract_text_from_pdf(file)
    client = get_supabase_client()
    file_path = f"{user_id}/{file.filename}"

    client.storage.from_("resumes").upload(file_path, file.file.read())

    result = client.table("resumes").insert({
        "user_id": user_id,
        "pdf_path": file_path,
        "raw_text": text
    }).execute()

    return result

