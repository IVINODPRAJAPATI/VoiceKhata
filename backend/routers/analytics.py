"""
analytics.py - Analytics and NL Query API endpoints for VoiceKhata.
Provides dashboard aggregation, natural language search, anomaly detection, and prediction.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend import models
from backend.analytics.predict import predict_next_month_expenses
from backend.analytics.anomaly import find_anomalies
from backend.nlp.query_engine import parse_query, build_answer
from collections import defaultdict
from pydantic import BaseModel

router = APIRouter(prefix="/analytics", tags=["analytics"])


class NLPQuery(BaseModel):
    query: str


@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    """Returns all aggregated data needed for the dashboard."""
    expenses = db.query(models.Expense).all()

    total = sum(e.amount for e in expenses)

    category_data = defaultdict(float)
    department_data = defaultdict(float)
    monthly_data = defaultdict(float)

    for e in expenses:
        if e.category:
            category_data[e.category] += e.amount
        if e.department:
            department_data[e.department] += e.amount
        if e.date:
            month_label = e.date.strftime("%b %Y")
            monthly_data[month_label] += e.amount

    # Sort months chronologically
    from datetime import datetime
    def parse_month(label):
        try:
            return datetime.strptime(label, "%b %Y")
        except Exception:
            return datetime.min

    sorted_months = sorted(monthly_data.keys(), key=parse_month)

    cat_charts = [{"name": k, "value": round(v, 2)} for k, v in category_data.items()]
    dept_charts = [{"name": k, "value": round(v, 2)} for k, v in department_data.items()]
    trend_charts = [{"name": m, "value": round(monthly_data[m], 2)} for m in sorted_months]

    history = [monthly_data[m] for m in sorted_months]
    predicted = predict_next_month_expenses(history)

    anomalies = find_anomalies(expenses)

    return {
        "total": round(total, 2),
        "categories": cat_charts,
        "departments": dept_charts,
        "trends": trend_charts,
        "prediction": round(predicted, 2),
        "anomalies": anomalies
    }


@router.post("/query")
def natural_language_query(req: NLPQuery, db: Session = Depends(get_db)):
    """
    Accepts a natural language query and returns matching expense records
    with a clear human-readable summary.

    Examples:
        "Show expenses for AI Lab this month"
        "Total spending on equipment in March"
        "How much did CSE spend last month?"
    """
    if not req.query.strip():
        return {"answer": "Please enter a query.", "data": [], "filters": {}}

    # Parse the NL query into structured filters
    filters = parse_query(req.query)

    # Check if we understood anything
    has_filters = any(k in filters for k in ["department", "category", "start_date"])
    if not has_filters:
        return {
            "answer": "I couldn't understand your query. Try: 'expenses for CSE this month' or 'total for equipment in April'.",
            "data": [],
            "filters": {}
        }

    # Build the SQLAlchemy query
    q = db.query(models.Expense)

    if "department" in filters:
        q = q.filter(
            func.lower(models.Expense.department) == filters["department"].lower()
        )

    if "category" in filters:
        q = q.filter(
            func.lower(models.Expense.category) == filters["category"].lower()
        )

    if "start_date" in filters:
        q = q.filter(models.Expense.date >= filters["start_date"])

    if "end_date" in filters:
        q = q.filter(models.Expense.date <= filters["end_date"])

    results = q.order_by(models.Expense.date.desc()).all()

    # Build human-readable answer
    answer = build_answer(filters, results)

    # Serialize results for frontend
    serialized = [
        {
            "id": r.id,
            "amount": r.amount,
            "date": r.date.strftime("%d %b %Y") if r.date else None,
            "category": r.category,
            "department": r.department,
            "description": r.description,
            "mode": r.mode,
        }
        for r in results
    ]

    return {
        "answer": answer,
        "data": serialized,
        "filters": {
            k: (v.isoformat() if hasattr(v, 'isoformat') else v)
            for k, v in filters.items()
            if k != "raw_query"
        }
    }
