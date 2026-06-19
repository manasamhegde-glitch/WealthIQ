from app.models.schemas import PortfolioSummary, GrowthPoint

# 1 unit of each currency in USD
EXCHANGE_RATES: dict[str, float] = {
    "USD": 1.0,
    "INR": 0.012,
    "EUR": 1.08,
    "GBP": 1.27,
    "JPY": 0.0067,
    "SGD": 0.74,
    "AED": 0.27,
    "CAD": 0.74,
    "AUD": 0.65,
}

CURRENCIES = list(EXCHANGE_RATES.keys())


def to_usd(value: float, currency: str) -> float:
    return round(value * EXCHANGE_RATES.get(currency, 1.0), 2)


def enrich_holdings(holdings: list[dict]) -> list[dict]:
    """Add value_usd and compute allocation % from total portfolio USD value."""
    with_usd = [{**h, "value_usd": to_usd(h["value"], h.get("currency", "USD"))}
                for h in holdings]
    total = sum(h["value_usd"] for h in with_usd)
    return [
        {**h, "allocation": round(h["value_usd"] / total * 100, 1) if total else 0}
        for h in with_usd
    ]


def enrich_goal(g: dict) -> dict:
    return {**g, "target_usd": to_usd(g["target"], g.get("currency", "USD"))}


SUMMARY = PortfolioSummary(
    user_name="Manasa Hegde",
    initials="MH",
    current_funds=42850,
    monthly_gain=1240,
    total_growth_pct=18.4,
    growth_since="Jan 2026",
    monthly_return_pct=2.9,
    avg_return_pct=2.4,
)

GROWTH: list[GrowthPoint] = [
    GrowthPoint(month="Jan", value=36200),
    GrowthPoint(month="Feb", value=37800),
    GrowthPoint(month="Mar", value=38500),
    GrowthPoint(month="Apr", value=39900),
    GrowthPoint(month="May", value=41610),
    GrowthPoint(month="Jun", value=42850, highlight=True),
]

HOLDINGS: list[dict] = [
    {"id": "h1", "name": "Nifty 50 ETF",    "type": "Mutual Funds", "currency": "INR", "value": 1_500_000, "change": 3.2},
    {"id": "h2", "name": "HDFC Bank",        "type": "Stocks",       "currency": "INR", "value": 780_000,   "change": 1.8},
    {"id": "h3", "name": "Govt Bond 2031",   "type": "Bonds",        "currency": "INR", "value": 635_000,   "change": 0.4},
    {"id": "h4", "name": "US S&P 500 Index", "type": "Mutual Funds", "currency": "USD", "value": 5_300,     "change": -0.6},
    {"id": "h5", "name": "Liquid Fund",      "type": "FD",           "currency": "INR", "value": 190_000,   "change": 0.1},
]

GOALS: list[dict] = [
    {"id": "g1", "name": "Emergency Fund",    "currency": "INR", "target": 5_000_000,   "deadline": "Dec 2026"},
    {"id": "g2", "name": "Home Down Payment", "currency": "INR", "target": 12_000_000,  "deadline": "Dec 2028"},
    {"id": "g3", "name": "Retirement Corpus", "currency": "INR", "target": 165_000_000, "deadline": "Dec 2045"},
]
