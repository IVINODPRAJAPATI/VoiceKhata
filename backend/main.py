from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import auth, expenses, analytics, reports
from backend.seed import seed_db

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VoiceKhata API",
    description="Backend API for Financial Expense Management"
)

@app.on_event("startup")
def startup_event():
    seed_db()

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(analytics.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "VoiceKhata API is ready."}
