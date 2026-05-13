import subprocess
import os
import tempfile
import json
import re
from core.config import settings
from langchain_nvidia_ai_endpoints import ChatNVIDIA # type: ignore
from langchain_core.prompts import ChatPromptTemplate # type: ignore
from langchain_core.output_parsers import StrOutputParser # type: ignore

llm = ChatNVIDIA(model="meta/llama-3.3-70b-instruct", nvidia_api_key=settings.NVIDIA_API_KEY)

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a LaTeX resume generator. You ONLY output raw LaTeX code. "
     "Never write explanations, markdown, or any text outside the LaTeX document. "
     "Your output must start with \\documentclass and end with \\end{{document}}. "
     "Use the resume data and apply all rewrites from the analysis. "
     "Use the latex template provided by the user and fill in the content based on the resume data and analysis. "
     ),
    ("user",
     "Resume Data: {resume_data}\n\n"
     "Analysis Results: {analysis_data}\n\n"
     "Resume_template: {resume_template}\n\n"
     "Generate the complete improved LaTeX resume now."
     )
])




def generate_improved_resume(resume_data: str, analysis_data: str, resume_template: str) -> str:
    chain = prompt | llm | StrOutputParser()

    result = chain.invoke({
        "resume_data": resume_data,
        "analysis_data": analysis_data,
        "resume_template": resume_template,
    })
    return result


def latex_to_pdf(latex_content: str) -> bytes:
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "resume.tex")
        pdf_path = os.path.join(tmpdir, "resume.pdf")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_content)

        result = subprocess.run(
            [r"C:\Program Files\MiKTeX\miktex\bin\x64\pdflatex.exe",
             "-interaction=nonstopmode",
             "-output-directory", tmpdir,
             tex_path],
            capture_output=True,
            text=True
        )

        if not os.path.exists(pdf_path):
            raise Exception(
                f"PDF compilation failed:\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
            )

        with open(pdf_path, "rb") as f:
            return f.read()

def generate_pdf_resume(resume_data: str, analysis_data: str, resume_template: str) -> bytes:
    updated_resume = generate_improved_resume(resume_data, analysis_data, resume_template)
    return latex_to_pdf(updated_resume)