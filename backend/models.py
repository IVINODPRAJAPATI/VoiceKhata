"""
models.py - SQLAlchemy ORM models for VoiceKhata.
Uses bcrypt directly to avoid passlib version conflicts.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from backend.database import Base
from datetime import datetime
import hashlib
import os

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Faculty")  # Admin, Faculty, Accountant

    def verify_password(self, plain_password: str) -> bool:
        """Verify a plain-text password against stored hash."""
        try:
            import bcrypt
            return bcrypt.checkpw(plain_password.encode("utf-8"), self.hashed_password.encode("utf-8"))
        except Exception:
            # Fallback to SHA-256 if bcrypt unavailable
            return self.hashed_password == hashlib.sha256(plain_password.encode()).hexdigest()

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a plain-text password."""
        try:
            import bcrypt
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
            return hashed.decode("utf-8")
        except Exception:
            # Fallback to SHA-256 if bcrypt unavailable
            return hashlib.sha256(password.encode()).hexdigest()


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    category = Column(String, index=True)   # Equipment, Maintenance, Events, etc.
    department = Column(String, index=True)
    description = Column(String)
    mode = Column(String)                   # Cash, Card, UPI, Bank Transfer
    created_by = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
