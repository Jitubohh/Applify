# Pydantic models for job data
from pydantic import BaseModel
from typing import List

class Analysis(BaseModel):
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    matched_projects: List[str]
    suggested_projects: List[str]
    improvement_suggestions: List[str]
    rewrites: List[str]
    overall_summary: str