"""
seed.py - Automatically seeds the database with demo users on first run.
Called from main.py startup hook. Safe to call multiple times (idempotent).
"""
from backend.database import engine, SessionLocal, Base
from backend.models import User, Expense
from datetime import datetime, timedelta
import random

def seed_db():
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Only seed if no users exist yet
        if db.query(User).first():
            print("[VoiceKhata] Database already seeded. Skipping.")
            return

        print("[VoiceKhata] Seeding demo users...")

        # Create demo accounts
        users_data = [
            {"name": "Admin User",   "email": "admin@vit.edu",      "password": "password", "role": "Admin"},
            {"name": "John Faculty", "email": "faculty@vit.edu",    "password": "password", "role": "Faculty"},
            {"name": "Jane Acc",     "email": "accountant@vit.edu", "password": "password", "role": "Accountant"},
        ]

        created_users = []
        for u in users_data:
            hashed = User.get_password_hash(str(u["password"]))  # ensure string
            user = User(
                name=u["name"],
                email=u["email"],
                hashed_password=hashed,
                role=u["role"]
            )
            db.add(user)
            created_users.append(user)

        db.commit()
        for u in created_users:
            db.refresh(u)

        faculty_user = created_users[1]

        print("[VoiceKhata] Seeding sample expenses...")

        categories = ["Equipment", "Maintenance", "Events", "Miscellaneous", "Salary", "Utilities"]
        departments = ["AI Lab", "CSE", "IT", "ECE"]
        modes = ["Cash", "Card", "UPI", "Bank Transfer"]

        for i in range(30):
            days_ago = random.randint(0, 60)
            random_date = datetime.now() - timedelta(days=days_ago)

            # Add a few intentionally high amounts to trigger anomaly detection
            if i % 15 == 0:
                amount = random.uniform(50000, 100000)
                desc = f"Major procurement for {random.choice(departments)}"
            else:
                amount = round(random.uniform(500, 8000), 2)
                desc = f"Regular transaction #{i}"

            exp = Expense(
                amount=amount,
                date=random_date,
                category=random.choice(categories),
                department=random.choice(departments),
                description=desc,
                mode=random.choice(modes),
                created_by=faculty_user.id
            )
            db.add(exp)

        db.commit()
        print("[VoiceKhata] Database seeded successfully.")

    except Exception as e:
        print(f"[VoiceKhata] Seeding error (non-fatal): {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
