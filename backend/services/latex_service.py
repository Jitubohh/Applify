import subprocess
import os
import tempfile
import json
from core.config import settings
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatNVIDIA(model="meta/llama-3.3-70b-instruct", nvidia_api_key=settings.NVIDIA_API_KEY)

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a LaTeX resume generator. You ONLY output raw LaTeX code. "
     "Never write explanations, markdown, or any text outside the LaTeX document. "
     "Your output must start with \\documentclass and end with \\end{{document}}. "
     "Use the resume data and apply all improvement suggestions and rewrites from the analysis. "
     "Use this exact LaTeX template structure:\n\n"
     "\\documentclass{{article}}\n"
     "\\usepackage{{geometry}}\n"
     "\\geometry{{margin=1in}}\n"
     "\\usepackage{{enumitem}}\n"
     "\\usepackage{{hyperref}}\n"
     "\\usepackage{{titlesec}}\n"
     "\\pagenumbering{{gobble}}\n"
     "\\begin{{document}}\n"
     "% Fill in all sections: name, contact, summary, experience, education, projects, skills\n"
     "% Apply all rewrites and improvements from the analysis\n"
     "\\end{{document}}\n\n"
     "Rules:\n"
     "1. ONLY output LaTeX. No explanations.\n"
     "2. Escape all special characters: & % $ # _ {{ }} ~ ^ \\\\\n"
     "3. Use \\\\textbf for headings\n"
     "4. Use itemize for bullet points\n"
     "5. Apply every rewrite and improvement suggestion from the analysis\n"
     "6. Add missing skills mentioned in the analysis to the skills section\n"
     "7. Do not invent information not present in the resume data\n"
     "8. The resume MUST fit on exactly one page - use smaller margins, smaller font, and concise bullet points\n"
     "9. Add \\\\usepackage[margin=0.5in]{{geometry}} to reduce margins\n"
     "10. Use 10pt font size in documentclass\n"
     "11. Do not add any text before \\\\documentclass or after \\\\end{{document}}"
     ),
    ("user",
     "Resume Data: {resume_data}\n\n"
     "Analysis Results: {analysis_data}\n\n"
     "Generate the complete improved LaTeX resume now."
     )
])


def generate_improved_resume(resume_data: str, analysis_data: str) -> dict:
    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"resume_data": resume_data, "analysis_data": analysis_data})
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
            raise Exception(f"PDF compilation failed: {result.stdout}")

        with open(pdf_path, "rb") as f:
            return f.read()

def generate_pdf_resume(resume_data: str, analysis_data: str) -> bytes:
    updated_resume = generate_improved_resume(resume_data, analysis_data)
    # Clean up markdown code blocks LLM might add
    updated_resume = updated_resume.replace("```latex", "").replace("```", "").strip()
    return latex_to_pdf(updated_resume)