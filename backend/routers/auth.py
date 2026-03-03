# Authentication routes
from fastapi import APIRouter, Depends
from core.security import verify_token 


router = APIRouter()

@router.get("/me")
def get_current_user(user = Depends(verify_token)):
    return user
