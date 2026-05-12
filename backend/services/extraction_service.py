# Service for extracting data from resumes
from models.resume_model import Resume
from core.config import settings
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.passthrough import RunnableAssign
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.output_parsers import StrOutputParser

llm = ChatNVIDIA(model="meta/llama-3.1-8b-instruct", nvidia_api_key = settings.NVIDIA_API_KEY)

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a professional resume extraction assistant. "
     "You will receive a resume in plain text format. "
     "Extract the actual data from the resume and return it as a JSON object. "
     "DO NOT return the schema or format instructions — return the ACTUAL DATA from the resume. "
     "This resume could be from ANY profession. "
     "Extract only information explicitly present in the resume. "
     "If a section is missing leave it as an empty list or empty string. "
     "Extract all of the following if present: "
     "name, email, phone, location, linkedin, github, website, summary, skills, "
     "experience (with company, role, duration, location, responsibilities), "
     "education (with institution, degree, field_of_study, graduation_date, gpa, location), "
     "projects (with name, description, technologies), "
     "certifications (with name, issuer, date), "
     "volunteer_work (with organization, role, duration, description), "
     "awards, languages, publications (with title, publisher, date). "
     "Return ONLY the filled JSON object with real data from the resume, nothing else.\n\n"
     "{format_instructions}"
     ),
    ("human", "{resume_text}")
])


def extract_resume(pydantic_class, llm, prompt):

    parser = PydanticOutputParser(pydantic_object=pydantic_class)
    instruct_merge = RunnableAssign({'format_instructions' : lambda x: parser.get_format_instructions()})
    def preparse(string):
        if '{' not in string: string = '{' + string
        if '}' not in string: string = string + '}'
        string = (string
            .replace(r"\\_", "_")
            .replace(r"\n", " ")
            .replace(r"\]", "]")
            .replace(r"\[", "[")
        )
        return string
    return instruct_merge | prompt | llm | StrOutputParser() | preparse | parser

def run_extraction(resume_text: str):
    chain = extract_resume(Resume, llm, prompt)
    return chain.invoke({"resume_text": resume_text})