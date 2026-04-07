import statistics

def find_anomalies(expenses_data: list):
    """
    Identifies unusually high expenses.
    expenses_data: list of dicts or SQLAlchemy models with 'id' and 'amount'
    """
    if len(expenses_data) < 5:
        # Not enough data for statistical anomaly detection
        return []

    amounts = [e.amount for e in expenses_data]
    mean = statistics.mean(amounts)
    try:
        stdev = statistics.stdev(amounts)
    except statistics.StatisticsError:
        stdev = 0
    
    threshold = mean + (2 * stdev) # 2 standard deviations above mean
    
    anomalies = []
    for exp in expenses_data:
        if exp.amount > threshold:
            anomalies.append({
                "id": exp.id,
                "amount": exp.amount,
                "description": exp.description,
                "reason": f"Amount is unusually high (average is {mean:.2f})"
            })
            
    return anomalies
