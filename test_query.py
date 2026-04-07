import sys
sys.path.insert(0, '.')
from backend.nlp.query_engine import parse_query

tests = [
    "Total expenses for CSE this month",
    "Equipment spending in AI Lab last month",
    "Show expenses for ECE in April",
    "How much did IT spend on salary this year",
    "total spending for dpartmet cse",
    "maintenance costs",
]

print("=== Query Engine Test Results ===\n")
for q in tests:
    r = parse_query(q)
    has_cat = "category" in r
    has_dept = "department" in r
    has_date = "start_date" in r
    print(f"Query: {q}")
    print(f"  Department: {r.get('department', 'NOT SET')}")
    print(f"  Category:   {r.get('category', 'NOT SET')}")
    print(f"  Date range: {'YES' if has_date else 'NO'}")
    print()
