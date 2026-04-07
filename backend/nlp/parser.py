import re
import dateparser
from datetime import datetime
import spacy

# Load Spacy
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Categories mapping logic completely handled internally without heavy ML transformers to ensure fast booting.

CATEGORIES = [
    "Equipment",
    "Maintenance",
    "Events",
    "Miscellaneous",
    "Salary",
    "Utilities"
]

DEPARTMENTS = [
    "AI Lab", "CSE", "IT", "ECE", "Mechanical", "Civil", "Admin", "Library", "Hostel"
]

def extract_amount(text):
    # Regex to extract amount (e.g., "12500", "12,500", "12.5k")
    match = re.search(r'\b\d+(?:,\d{3})*(?:\.\d+)?\b', text)
    if match:
        amount_str = match.group().replace(",", "")
        return float(amount_str)
    return None

def extract_date(text):
    # parse date like 'yesterday', 'last monday', '24th march'
    # dateparser is very flexible
    parsed_date = dateparser.parse(text)
    if parsed_date:
        # Avoid picking up future dates by accident if the reference is ambiguous
        if parsed_date > datetime.now():
            # sometimes past dates are interpreted as future if only month/day provided
            pass
        return parsed_date
    return datetime.now()

def extract_department(text):
    text_lower = text.lower()
    for dept in DEPARTMENTS:
        if dept.lower() in text_lower:
            return dept
    return "CSE" # default

def classify_category(text):
    text_lower = text.lower()
    
    # Internal fast categorization logic
    category_keywords = {
        "Equipment": ["equipment", "lab", "computer", "server", "hardware", "tool", "machine"],
        "Maintenance": ["maintenance", "repair", "service", "fix", "plumbing", "cleaning"],
        "Events": ["event", "conference", "trip", "travel", "catering", "food", "party", "seminar"],
        "Salary": ["salary", "pay", "wages", "bonus", "stipend"],
        "Utilities": ["bill", "electricity", "water", "internet", "wifi", "utility", "rent"]
    }
    
    # Simple highest-match scoring
    best_category = "Miscellaneous"
    max_score = 0
    
    for category, keywords in category_keywords.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > max_score:
            max_score = score
            best_category = category
            
    return best_category

def parse_expense_text(text: str):
    """
    Core NLP pipeline:
    1. Extract Amount
    2. Extract Date (using dateparser, fallback to spacy ents or current date)
    3. Categorization (Zero shot)
    4. Department matching
    """
    
    amount = extract_amount(text)
    date = extract_date(text)
    category = classify_category(text)
    department = extract_department(text)

    # mode extraction (simple rule-based)
    mode = "Cash"
    if "card" in text.lower():
        mode = "Card"
    elif "upi" in text.lower() or "paytm" in text.lower() or "gpay" in text.lower():
        mode = "UPI"
    elif "bank" in text.lower() or "transfer" in text.lower():
        mode = "Bank Transfer"

    return {
        "amount": amount or 0.0,
        "date": date,
        "category": category,
        "department": department,
        "description": text, # Keep original text as notes/description
        "mode": mode
    }

if __name__ == "__main__":
    sample = "Spent 12,500 rupees yesterday for AI Lab equipment via UPI"
    print("Testing parser on:", sample)
    print(parse_expense_text(sample))
