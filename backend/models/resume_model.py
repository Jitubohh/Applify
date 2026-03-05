# Pydantic models for resume data
from typing import List
from pydantic import BaseModel, Field

class Experience(BaseModel):
    company: str = Field("", description = "Name of company experience was gained at")
    role: str = Field("", description = "Role held at the company")
    duration: str = Field("", description = "Duration of the experience")
    responsibilities: List[str] = Field([], description = "List of responsibilities and achievements in the role")

class Project(BaseModel):
    name: str = Field("", description = "Name of the project")
    description: str = Field("", description = "Description of the project")
    technologies: List[str] = Field([], description = "List of technologies used in the project")

class Certification(BaseModel):
    name: str 
    issuer: str

class Resume(BaseModel):
    name: str = Field("", description = "Full name of the candidate")
    email: str = Field("", description = "Email address of the candidate")
    location: str = Field("", description = "Location of the candidate")
    skills: List[str] = Field([], description = "List of skills possessed by the candidate")
    experience: List[Experience] = Field([], description = "List of work experiences")
    projects: List[Project] = Field([], description = "List of projects created or worked on")
    education: List[str] = Field([], description = "List of educational qualifications")
    certifications: List[Certification] = Field([], description = "List of certifications obtained")