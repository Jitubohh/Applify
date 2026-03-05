# Pydantic models for resume data
from typing import List
from pydantic import BaseModel

class Experience(BaseModel):
    company: str
    role: str
    duration: str 
    responsibilities: List[str]

class Project(BaseModel):
    name: str
    description: str
    technologies: List[str]

class Certification(BaseModel):
    name: str
    issuer: str

class Resume(BaseModel):
    name: str
    email: str
    location: str
    skills: List[str]
    experience: List[Experience]
    projects: List[Project]
    education: List[str]
    certifications: List[Certification]

