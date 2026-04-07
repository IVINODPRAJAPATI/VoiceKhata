from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "voicekhata-production-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Faculty"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials - Email not registered.")
        
    if not db_user.verify_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials - Incorrect password.")
    
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": db_user.role, "name": db_user.name}
