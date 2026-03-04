# Security utilities and authentication functions
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from core.config import settings
import requests

security = HTTPBearer()

def get_jwks():
    url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    response = requests.get(url)
    return response.json()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    jwks = get_jwks()

    try:
        payload = jwt.decode(token, jwks, algorithms=["ES256"], audience="authenticated")
        return payload
    
    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )    