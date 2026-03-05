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
    ("system","You are a resume grading and improvement assistant"
    "You'll recieve a resume in plain text format and extract the relevant information to fill out a structured resume format. Only extract information that is present in the resume, " \
    "\n\n{format_instructions}. Follow the format precisely, including quotations and commas"
    "do not make assumptions or add information that is not explicitly stated in the resume. If certain sections of the resume are missing, leave them blank or empty. " \
    "Always return the output in the specified structured format and ensure it adheres to the Pydantic model provided"),
    ("human", "{resume_text}")
]
)


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