import subprocess
import os
import tempfile
from core.config import settings
from langchain_nvidia_ai_endpoints import ChatNVIDIA # type: ignore
from langchain_core.prompts import ChatPromptTemplate # type: ignore
from langchain_core.output_parsers import StrOutputParser # type: ignore

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
ALLOWED_TEMPLATE_IDS = {
    "classic", "modern", "executive", "creative", "academic", "minimal"
}

llm = ChatNVIDIA(
    model="meta/llama-3.3-70b-instruct",
    nvidia_api_key=settings.NVIDIA_API_KEY,
    max_tokens=7000,
)

prompt = ChatPromptTemplate.from_messages([
   ("system",
 "You are a LaTeX resume generator. You ONLY output raw LaTeX code. "
 "Never write explanations, markdown, or any text outside the LaTeX document. "
 "Your output must start with \\documentclass and end with \\end{{document}}. "
 "Use the resume data and apply all rewrites from the analysis. "
 "Use the latex template provided and fill in ALL content from the resume. "
 "Do not truncate or omit any content — include everything. "
 "If a section has no data from the resume, omit the entire section including its header. "
 "Never show an empty section. "
 "The resume can span multiple pages if needed. "
 "Preserve concrete detail from source text. Do not compress bullets into vague summaries. "
 "CRITICAL ESCAPING RULES:\n"
 "1. Replace & with \\&\n"
 "2. Replace % with \\%\n"
 "3. Replace # with \\#\n"
 "4. Replace $ with \\$\n"
 "5. Replace _ with \\_\n"
 "6. Never leave unmatched braces\n"
 "7. Never use characters that could be interpreted as LaTeX commands inside text"
 ),
    ("user",
    "Raw Resume Text: {resume_raw_text}\n\n"
    "Structured Resume Data JSON: {resume_data}\n\n"
     "Analysis Results: {analysis_data}\n\n"
     "Resume Template: {resume_template}\n\n"
     "Generate the complete improved LaTeX resume now. Remember to escape all special characters."
     )
])




def _load_template_content(template_id_or_content: str) -> str:
    value = (template_id_or_content or "").strip()

    # Allow direct template content for flexibility/tests.
    if "\\documentclass" in value:
        return value

    template_id = value.lower()
    if template_id not in ALLOWED_TEMPLATE_IDS:
        raise ValueError(f"Invalid template id: {template_id}")

    template_path = os.path.join(TEMPLATES_DIR, f"{template_id}.tex")
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found: {template_path}")

    with open(template_path, "r", encoding="utf-8") as f:
        return f.read()


def generate_improved_resume(resume_data: str, analysis_data: str, resume_template: str, resume_raw_text: str = "") -> str:
    template_content = _load_template_content(resume_template)
    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({
        "resume_raw_text": resume_raw_text,
        "resume_data": resume_data,
        "analysis_data": analysis_data,
        "resume_template": template_content
    })
    result = result.replace("```latex", "").replace("```", "").strip()
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

def generate_pdf_resume(resume_data: str, analysis_data: str, resume_template: str, resume_raw_text: str = "") -> bytes:
    updated_resume = generate_improved_resume(resume_data, analysis_data, resume_template, resume_raw_text)
    return latex_to_pdf(updated_resume)