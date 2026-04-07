import statistics

def predict_next_month_expenses(history_amounts: list) -> float:
    """
    Very simple linear regression or moving average for predictive budgeting.
    history_amounts: List of total amount spent per month for the past N months.
    """
    if not history_amounts:
        return 0.0
    
    # If we only have one month, predict the same
    if len(history_amounts) == 1:
        return history_amounts[0]
        
    # Simple moving average for prototype
    # Weighted towards recent months
    weights = list(range(1, len(history_amounts) + 1))
    weighted_sum = sum(v * w for v, w in zip(history_amounts, weights))
    return weighted_sum / sum(weights)
