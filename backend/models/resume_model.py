# Pydantic models for resume data
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


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


class AdditionalSection(BaseModel):
    heading: str = Field("", description="Section heading from the resume")
    text: Optional[str] = Field("", description="Free-form section content")
    items: List[str] = Field(default_factory=list, description="Bullet items for the section")


class Resume(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str = Field("", description = "Full name of the candidate")
    headline: Optional[str] = Field("", description = "Target title, headline, or role summary")
    email: str = Field("", description = "Email address of the candidate")
    phone: Optional[str] = Field("", description = "Phone number of the candidate")
    location: str = Field("", description = "Location of the candidate")
    linkedin: Optional[str] = Field("", description = "LinkedIn profile URL")
    github: Optional[str] = Field("", description = "GitHub profile URL")
    website: Optional[str] = Field("", description = "Personal website URL")
    summary: Optional[str] = Field("", description = "Summary of the candidate's background and goals")
    objective: Optional[str] = Field("", description = "Career objective or profile objective")
    professional_summary: Optional[str] = Field("", description = "Professional summary section")
    profile: Optional[str] = Field("", description = "Profile section text")
    about: Optional[str] = Field("", description = "About section text")
    
    skills: List[str] = Field(default_factory=list, description = "List of skills possessed by the candidate")
    technical_skills: List[str] = Field(default_factory=list, description = "Technical skills section")
    core_competencies: List[str] = Field(default_factory=list, description = "Core competencies or strengths")
    tools: List[str] = Field(default_factory=list, description = "Tools, frameworks, or software")
    experience: List[Experience] = Field(default_factory=list, description = "List of work experiences")
    work_experience: List[Experience] = Field(default_factory=list, description = "Work experience section")
    professional_experience: List[Experience] = Field(default_factory=list, description = "Professional experience section")
    projects: List[Project] = Field(default_factory=list, description = "List of projects undertaken by the candidate")
    selected_projects: List[Project] = Field(default_factory=list, description = "Selected projects section")
    education: List[Education] = Field(default_factory=list, description = "List of educational qualifications")
    certifications: List[Certification] = Field(default_factory=list, description = "List of certifications obtained")
    volunteer_work: List[VolunteerWork] = Field(default_factory=list, description = "List of volunteer work experiences")
    volunteer_experience: List[VolunteerWork] = Field(default_factory=list, description = "Volunteer experience section")
    awards: List[str] = Field(default_factory=list, description = "List of awards and honors received")
    honors: List[str] = Field(default_factory=list, description = "List of honors received")
    achievements: List[str] = Field(default_factory=list, description = "List of achievements")
    languages: List[str] = Field(default_factory=list, description = "List of languages spoken by the candidate")
    interests: List[str] = Field(default_factory=list, description = "List of interests or hobbies")
    coursework: List[str] = Field(default_factory=list, description = "Relevant coursework")
    patents: List[str] = Field(default_factory=list, description = "Patents or patent applications")
    leadership: List[str] = Field(default_factory=list, description = "Leadership roles or leadership highlights")
    publications: List[Publication] = Field(default_factory=list, description = "List of publications authored by the candidate")
    references: List[str] = Field(default_factory=list, description = "References or referees")
    additional_sections: List[AdditionalSection] = Field(default_factory=list, description = "Any other resume sections not covered above")