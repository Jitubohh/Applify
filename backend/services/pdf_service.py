# Service for PDF processing
import pdfplumber
from fastapi import UploadFile

def extract_text_from_pdf(file: UploadFile):
    with pdfplumber.open(file.file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

