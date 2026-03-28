# Pydantic models for resume data
from typing import List, Optional
from pydantic import BaseModel, Field


class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = ""
    graduation_date: str
    gpa: Optional[str] = ""
    location: Optional[str] = ""

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
    name: str = Field("", description = "Name of the certification")
    issuer: str = Field("", description = "Issuer of the certification")

class VolunteerWork(BaseModel):
    organization: str
    role: str
    duration: str
    description: Optional[str] = ""

class Publication(BaseModel):
    title: str
    publisher: Optional[str] = Field("", description = "Publisher of the publication")
    date: Optional[str] = Field("", description = "Publication date")

class Resume(BaseModel):
    name: str = Field("", description = "Full name of the candidate")
    email: str = Field("", description = "Email address of the candidate")
    phone: Optional[str] = Field("", description = "Phone number of the candidate")
    location: str = Field("", description = "Location of the candidate")
    linkedin: Optional[str] = Field("", description = "LinkedIn profile URL")
    github: Optional[str] = Field("", description = "GitHub profile URL")
    website: Optional[str] = Field("", description = "Personal website URL")
    summary: Optional[str] = Field("", description = "Summary of the candidate's background and goals")
    
    skills: List[str] = Field([], description = "List of skills possessed by the candidate")
    experience: List[Experience] = Field([], description = "List of work experiences")
    projects: Optional[List[Project]] = Field([], description = "List of projects undertaken by the candidate")
    education: List[Education] = Field([], description = "List of educational qualifications")
    certifications: List[Certification] = Field([], description = "List of certifications obtained")
    volunteer_work: Optional[List[VolunteerWork]] = Field([], description = "List of volunteer work experiences")
    awards: Optional[List[str]] = Field([], description = "List of awards and honors received")
    languages: Optional[List[str]] = Field([], description = "List of languages spoken by the candidate")
    publications: Optional[List[Publication]] = Field([], description = "List of publications authored by the candidate")

class Resume(BaseModel):
    name: str
    email: str
    location: str
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    website: Optional[str] = ""
    summary: Optional[str] = ""
    skills: List[str]
    experience: List[Experience]
    education: List[Education]
    certifications: Optional[List[Certification]] = []
    volunteer_work: Optional[List[VolunteerWork]] = []
    awards: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    publications: Optional[List[Publication]] = []