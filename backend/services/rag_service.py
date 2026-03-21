#compares resume data with job description requirements and generates a report
from models.analysis_model import Analysis
from core.config import settings
from langchain_nvidia_ai_endpoints import ChatNVIDIA # type: ignore
from langchain_core.prompts import ChatPromptTemplate # type: ignore
from langchain_core.runnables.passthrough import RunnableAssign # type: ignore
from langchain_core.output_parsers import PydanticOutputParser # type: ignore
from langchain_core.output_parsers import StrOutputParser # type: ignore

llm = ChatNVIDIA(model="meta/llama-3.3-70b-instruct", nvidia_api_key=settings.NVIDIA_API_KEY)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a resume grading and improvement assistant"
    "You'll recieve the resume in plain json format and job description in plain text."
    "YOU ARE ONLY TO RESPOND IN VALID STRUCTURED JSON FORMAT ADHERING TO THE PROVIDED PYDANTIC MODEL. DO NOT RESPOND WITH ANY EXPLANATIONS OR TEXT OUTSIDE OF THE STRUCTURED JSON."
    "Your task is to analyze the resume against the job description and generate a comprehensive report and fill out a structured analysis format " \
    "For the suggest projects section you are to suggest examples of projects the candidate can add to their resume to make it more appealing for the specific job description. These should be based on the candidate's existing experience and skills, and should be relevant to the job description. " \
    "\n\n{format_instructions}. Follow the format precisely, including quotations and commas"
    "do not make assumptions or add information that is not explicitly stated in the resume data or job description. If certain sections of the analysis are missing, leave them blank or empty. " \
    "Always return the output in the specified structured format and ensure it adheres to the Pydantic model provided"),
    ("user", "{resume_data} {job_description}")
])

def fill_analysis(pydantic_class, llm, prompt):

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

def run_analysis(resume_data: str, job_description: str):
    chain = fill_analysis(Analysis, llm, prompt)
    return chain.invoke({"resume_data": resume_data, "job_description": job_description})