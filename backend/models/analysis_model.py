# Pydantic models for match data
from pydantic import BaseModel, Field
from typing import List

class Analysis(BaseModel):
    match_score: float = Field("", description="Overall score in percentage of the match between candidates resume and job description")
    matched_skills: List[str] = Field([], description="List of skills that matched between the candidates resume and job description")
    missing_skills: List[str] = Field([], description="List of skills that were in the job description but missing from the candidates resume")
    matched_projects: List[str] = Field([], description="List of projects that aligned the candidates resume and job description")
    suggested_projects: List[str] = Field([], description="List of projects that the candidate could add to their resume to better match the job description")
    improvement_suggestions: List[str] = Field([], description="List of suggestions for improving the candidate's resume")
    rewrites: List[str] = Field([], description="List of suggested rewrites for the candidate's resume")
    overall_summary: str = Field("", description="Overall summary of the analysis")