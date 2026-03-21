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
     "You are a resume improvement assistant. "
     "You ONLY respond with valid JSON and nothing else. "
     "No markdown, no explanations, no code blocks. "
     "Given resume data and analysis results, return improved content as JSON with these exact keys:\n"
     "name, email, location, linkedin, github, summary, "
     "education (list of objects with: institution, location, degree, date), "
     "experience (list of objects with: title, company, location, duration, responsibilities as list of strings), "
     "projects (list of objects with: name, technologies as a plain comma-separated string, date, description as list of strings), "
     "languages (plain comma-separated string), "
     "frameworks (plain comma-separated string), "
     "tools (plain comma-separated string)"
     ),
    ("user",
     "Resume Data: {resume_data}\n\n"
     "Analysis Results: {analysis_data}\n\n"
     "Return the improved resume content as JSON only."
     )
])

def escape(text):
    if not isinstance(text, str):
        if isinstance(text, list):
            text = ", ".join(str(i) for i in text)
        else:
            text = str(text)
    return (text
        .replace("&", r"\&")
        .replace("%", r"\%")
        .replace("#", r"\#")
        .replace("_", r"\_")
        .replace("$", r"\$")
    )

def generate_improved_resume(resume_data: str, analysis_data: str) -> dict:
    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"resume_data": resume_data, "analysis_data": analysis_data})
    result = result.replace("```json", "").replace("```", "").strip()
    return json.loads(result)

def fill_template(data: dict) -> str:
    education_entries = ""
    for edu in data.get("education", []):
        education_entries += f"""
\\resumeSubheading
  {{{escape(edu.get('institution',''))}}}
  {{{escape(edu.get('location',''))}}}
  {{{escape(edu.get('degree',''))}}}
  {{{escape(edu.get('date',''))}}}
"""

    experience_entries = ""
    for exp in data.get("experience", []):
        items = "\n".join([f"  \\resumeItem{{{escape(r)}}}" for r in exp.get("responsibilities", [])])
        experience_entries += f"""
\\resumeSubheading
  {{{escape(exp.get('title',''))}}}
  {{{escape(exp.get('duration',''))}}}
  {{{escape(exp.get('company',''))}}}
  {{{escape(exp.get('location',''))}}}
\\resumeItemListStart
{items}
\\resumeItemListEnd
"""

    project_entries = ""
    for proj in data.get("projects", []):
        desc = proj.get("description", [])
        if isinstance(desc, str):
            desc = [desc]
        items = "\n".join([f"  \\resumeItem{{{escape(d)}}}" for d in desc])
        tech = proj.get("technologies", "")
        if isinstance(tech, list):
            tech = ", ".join(tech)
        project_entries += f"""
\\resumeProjectHeading
  {{\\textbf{{{escape(proj.get('name',''))}}} $|$ {escape(tech)}}}{{{escape(proj.get('date',''))}}}
\\resumeItemListStart
{items}
\\resumeItemListEnd
"""

    languages = escape(data.get("languages", ""))
    frameworks = escape(data.get("frameworks", ""))
    tools = escape(data.get("tools", ""))

    template = r"""\documentclass[letterpaper,10pt]{article}
\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.7in}
\addtolength{\textheight}{1.2in}
\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}
\titleformat{\section}{\vspace{-4pt}\scshape\raggedright\small}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]
\newcommand{\resumeItem}[1]{\item\small{#1 \vspace{-2pt}}}
\newcommand{\resumeSubheading}[4]{\vspace{-2pt}\item\begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}\textbf{#1} & #2 \\\textit{\small#3} & \textit{\small #4} \\\end{tabular*}\vspace{-7pt}}
\newcommand{\resumeProjectHeading}[2]{\item\begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}\small#1 & #2 \\\end{tabular*}\vspace{-7pt}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=*]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\begin{document}
""" + f"""
\\begin{{center}}
    {{\\Large \\scshape {escape(data.get('name',''))}}} \\\\ \\vspace{{2pt}}
    {escape(data.get('location',''))} \\\\ \\vspace{{1pt}}
    \\small \\href{{mailto:{escape(data.get('email',''))}}}{{\\underline{{{escape(data.get('email',''))}}}}} $|$
    \\href{{{escape(data.get('linkedin',''))}}}{{\\underline{{{escape(data.get('linkedin',''))}}}}} $|$
    \\href{{{escape(data.get('github',''))}}}{{\\underline{{{escape(data.get('github',''))}}}}}
\\end{{center}}

\\section{{Education}}
\\resumeSubHeadingListStart
{education_entries}
\\resumeSubHeadingListEnd

\\section{{Experience}}
\\resumeSubHeadingListStart
{experience_entries}
\\resumeSubHeadingListEnd

\\section{{Projects}}
\\resumeSubHeadingListStart
{project_entries}
\\resumeSubHeadingListEnd

\\section{{Technical Skills}}
\\begin{{itemize}}[leftmargin=0.15in, label={{}}]
\\item \\small{{
    \\textbf{{Languages:}} {languages} \\\\
    \\textbf{{Frameworks:}} {frameworks} \\\\
    \\textbf{{Tools:}} {tools}
}}
\\end{{itemize}}

\\end{{document}}
"""
    return template

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
    content = generate_improved_resume(resume_data, analysis_data)
    latex = fill_template(content)
    return latex_to_pdf(latex)