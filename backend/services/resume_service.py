from db.supabase_client import get_supabase_client
from services.pdf_service import extract_text_from_pdf
from fastapi import UploadFile
from services.extraction_service import run_extraction

#process and store resume data
def process_resume(file: UploadFile, user_id: str):
    text = extract_text_from_pdf(file)
    #Convert pydantic model to dict for supabase storage
    structured_resume = run_extraction(text).model_dump()
    client = get_supabase_client()
    file_path = f"{user_id}/{file.filename}"

    client.storage.from_("resumes").upload(file_path, file.file.read())

    result = client.table("resumes").insert({
        "user_id": user_id,
        "pdf_path": file_path,
        "raw_text": text,
        "structured_json": structured_resume
    }).execute()

    return result

