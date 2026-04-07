"""
query_engine.py - Natural Language Query Parser for VoiceKhata.

Converts user queries like:
  "Show expenses for AI Lab last month"
  "Total spending for CSE in April"
into structured database filters with correct date ranges and aggregation.
"""

from datetime import datetime, date
from calendar import monthrange

# All known departments (normalized for fuzzy matching)
DEPARTMENTS = {
    "ai lab": "AI Lab",
    "cse": "CSE",
    "it": "IT",
    "ece": "ECE",
    "mechanical": "Mechanical",
    "civil": "Civil",
    "admin": "Admin",
    "library": "Library",
    "hostel": "Hostel",
}

CATEGORIES = {
    "equipment": "Equipment",
    "maintenance": "Maintenance",
    "events": "Events",
    "event": "Events",
    "miscellaneous": "Miscellaneous",
    "misc": "Miscellaneous",
    "salary": "Salary",
    "utilities": "Utilities",
    "utility": "Utilities",
}

MONTH_NAMES = {
    "january": 1, "jan": 1,
    "february": 2, "feb": 2,
    "march": 3, "mar": 3,
    "april": 4, "apr": 4,
    "may": 5,
    "june": 6, "jun": 6,
    "july": 7, "jul": 7,
    "august": 8, "aug": 8,
    "september": 9, "sep": 9, "sept": 9,
    "october": 10, "oct": 10,
    "november": 11, "nov": 11,
    "december": 12, "dec": 12,
}

def fuzzy_match_department(text_lower: str, lookup: dict) -> str | None:
    """
    Fuzzy matches department names only.
    Tries 2-word phrases first, then single words.
    """
    words = text_lower.split()
    for i in range(len(words)):
        # Try 2-word phrase (e.g. "ai lab")
        if i < len(words) - 1:
            phrase = f"{words[i]} {words[i+1]}"
            if phrase in lookup:
                return lookup[phrase]
        # Single word exact
        if words[i] in lookup:
            return lookup[words[i]]
    # Partial containment fallback (e.g. 'cse dept' → 'cse')
    for key in lookup:
        if key in text_lower:
            return lookup[key]
    return None


def strict_match_category(text_lower: str, lookup: dict) -> str | None:
    """
    Strict whole-word category matching only.
    Will NOT match if the word is a substring of another word.
    e.g. 'expenses' will NOT match 'events'.
    """
    import re
    for key, value in lookup.items():
        # Use word boundary regex to ensure exact word match
        pattern = r'\b' + re.escape(key) + r'\b'
        if re.search(pattern, text_lower):
            return value
    return None


def parse_query(text: str) -> dict:
    """
    Parses a natural language query string and returns structured filters:
    {
        "department": str | None,
        "category": str | None,
        "start_date": datetime | None,
        "end_date": datetime | None,
        "raw_query": str
    }
    """
    text_lower = text.lower().strip()
    filters = {"raw_query": text}

    now = datetime.now()

    # --- Time Range Detection ---
    if "this month" in text_lower or "current month" in text_lower:
        start = datetime(now.year, now.month, 1)
        last_day = monthrange(now.year, now.month)[1]
        end = datetime(now.year, now.month, last_day, 23, 59, 59)
        filters["start_date"] = start
        filters["end_date"] = end

    elif "last month" in text_lower or "previous month" in text_lower:
        if now.month == 1:
            month, year = 12, now.year - 1
        else:
            month, year = now.month - 1, now.year
        last_day = monthrange(year, month)[1]
        filters["start_date"] = datetime(year, month, 1)
        filters["end_date"] = datetime(year, month, last_day, 23, 59, 59)

    elif "today" in text_lower:
        filters["start_date"] = datetime(now.year, now.month, now.day, 0, 0, 0)
        filters["end_date"] = datetime(now.year, now.month, now.day, 23, 59, 59)

    elif "this year" in text_lower or "current year" in text_lower:
        filters["start_date"] = datetime(now.year, 1, 1)
        filters["end_date"] = datetime(now.year, 12, 31, 23, 59, 59)

    else:
        # Try to find a named month like "april", "march"
        words = text_lower.replace(",", " ").split()
        for word in words:
            month_num = MONTH_NAMES.get(word)
            if month_num:
                year = now.year
                # If month is in the future by more than 1, assume previous year
                if month_num > now.month + 1:
                    year = now.year - 1
                last_day = monthrange(year, month_num)[1]
                filters["start_date"] = datetime(year, month_num, 1)
                filters["end_date"] = datetime(year, month_num, last_day, 23, 59, 59)
                break

    # --- Department Detection (fuzzy) ---
    dept_match = fuzzy_match_department(text_lower, DEPARTMENTS)
    if dept_match:
        filters["department"] = dept_match

    # --- Category Detection (strict word-boundary only) ---
    # Only set if user explicitly names a category like "equipment", "salary"
    cat_match = strict_match_category(text_lower, CATEGORIES)
    if cat_match:
        filters["category"] = cat_match

    return filters


def build_answer(filters: dict, results: list) -> str:
    """
    Builds a clear natural language answer from results.
    """
    count = len(results)
    total = sum(r.amount for r in results)

    if count == 0:
        parts = []
        if "department" in filters:
            parts.append(f"department '{filters['department']}'")
        if "category" in filters:
            parts.append(f"category '{filters['category']}'")
        if "start_date" in filters:
            parts.append(f"the selected period")
        scope = " in ".join(parts) if parts else "this query"
        return f"No expense records found for {scope}."

    dept_str = f" for **{filters['department']}**" if "department" in filters else ""
    cat_str = f" under **{filters['category']}**" if "category" in filters else ""

    period_str = ""
    if "start_date" in filters:
        period_str = f" from {filters['start_date'].strftime('%d %b')} to {filters['end_date'].strftime('%d %b %Y')}"

    return (
        f"Found **{count}** record{'s' if count != 1 else ''}{dept_str}{cat_str}{period_str}. "
        f"Total amount: **₹{total:,.2f}**."
    )
