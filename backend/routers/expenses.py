import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from backend.nlp.parser import parse_expense_text
from backend.nlp.ocr import extract_text_from_image

router = APIRouter(prefix="/expenses", tags=["expenses"])

class ExpenseCreate(BaseModel):
    amount: float
    date: datetime
    category: str
    department: str
    description: str
    mode: str

class ParseRequest(BaseModel):
    text: str

@router.post("/parse")
def parse_text(req: ParseRequest):
    """
    Takes natural language text and returns structured fields.
    """
    parsed = parse_expense_text(req.text)
    return parsed

@router.post("/upload_receipt")
async def upload_receipt(file: UploadFile = File(...)):
    """
    Accepts an image, runs OCR to extract text, and then runs NLP.
    """
    contents = await file.read()
    text = extract_text_from_image(contents)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from image")
    
    parsed = parse_expense_text(text)
    return {"extracted_text": text, "parsed_data": parsed}

@router.post("/")
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    # Assuming user 1 for simplicity in prototype if no auth token is passed
    # In a real app we'd decode JWT and get user_id
    db_expense = models.Expense(
        amount=expense.amount,
        date=expense.date,
        category=expense.category,
        department=expense.department,
        description=expense.description,
        mode=expense.mode,
        created_by=1 
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/")
def get_expenses(db: Session = Depends(get_db)):
    return db.query(models.Expense).order_by(models.Expense.date.desc()).all()
