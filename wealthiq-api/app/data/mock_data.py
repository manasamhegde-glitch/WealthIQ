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
    """Add value_usd, contribution_usd, cost_basis_usd, and compute allocation %."""
    with_usd = [
        {
            **h,
            "value_usd":      to_usd(h["value"],                  h.get("currency", "USD")),
            "contribution_usd": to_usd(h.get("contribution", 0.0), h.get("currency", "USD")),
            "cost_basis_usd": to_usd(h.get("cost_basis", 0.0),    h.get("currency", "USD")),
        }
        for h in holdings
    ]
    total = sum(h["value_usd"] for h in with_usd)
    return [
        {**h, "allocation": round(h["value_usd"] / total * 100, 1) if total else 0}
        for h in with_usd
    ]


def enrich_liability(l: dict) -> dict:
    return {**l, "balance_usd": to_usd(l["balance"], l.get("currency", "USD"))}


def enrich_goal(g: dict) -> dict:
    return {**g, "target_usd": to_usd(g["target"], g.get("currency", "USD"))}


SUMMARY = PortfolioSummary(
    user_name="Manasa Hegde",
    initials="MH",
    current_funds=0,
    net_worth=0,
    total_liabilities=0,
    monthly_gain=0,
    total_growth_pct=0,
    growth_since="Jan 2026",
    monthly_return_pct=0,
    avg_return_pct=0,
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
    # SIP – monthly contribution; ₹9L lumpsum Jan 2023 + ₹10K/mo SIP
    {"id": "h1", "name": "Nifty 50 ETF",    "type": "Mutual Funds", "currency": "INR", "value": 1_500_000, "change": 3.2,  "start_date": "Jan 2023", "maturity_date": "",        "contribution": 10_000, "contribution_freq": "Monthly", "cost_basis": 900_000},
    # Stocks – lump-sum ₹6.8L, no SIP
    {"id": "h2", "name": "HDFC Bank",        "type": "Stocks",       "currency": "INR", "value": 780_000,   "change": 1.8,  "start_date": "Mar 2022", "maturity_date": "",        "contribution": 0,      "contribution_freq": "None",    "cost_basis": 680_000},
    # Bond – lump-sum ₹6.1L, matures Dec 2031
    {"id": "h3", "name": "Govt Bond 2031",   "type": "Bonds",        "currency": "INR", "value": 635_000,   "change": 0.4,  "start_date": "Jan 2021", "maturity_date": "Dec 2031","contribution": 0,      "contribution_freq": "None",    "cost_basis": 610_000},
    # SIP in USD – no lumpsum, pure $200/mo SIP from Jun 2024
    {"id": "h4", "name": "US S&P 500 Index", "type": "Mutual Funds", "currency": "USD", "value": 5_300,     "change": -0.6, "start_date": "Jun 2024", "maturity_date": "",        "contribution": 200,    "contribution_freq": "Monthly", "cost_basis": 0},
    # RD – ₹1.5L lumpsum + ₹5K/mo SIP from Nov 2025
    {"id": "h5", "name": "Liquid Fund RD",   "type": "RD",           "currency": "INR", "value": 190_000,   "change": 6.5,  "start_date": "Nov 2025", "maturity_date": "Nov 2028","contribution": 5_000,  "contribution_freq": "Monthly", "cost_basis": 150_000},
    # NPS – ₹2L lumpsum + ₹50K/yr from Apr 2020; value updated to reflect 9.2% growth
    {"id": "h6", "name": "NPS Tier-I",       "type": "NPS",          "currency": "INR", "value": 750_000,   "change": 9.2,  "start_date": "Apr 2020", "maturity_date": "",        "contribution": 50_000, "contribution_freq": "Yearly",  "cost_basis": 200_000},
]

LIABILITIES: list[dict] = [
    {"id": "l1", "name": "Home Loan – HDFC",    "type": "Mortgage",     "currency": "INR", "balance": 5_000_000, "interest_rate": 8.5,  "start_date": "Jan 2022", "end_date": "Dec 2042"},
    {"id": "l2", "name": "Car Loan – Axis",      "type": "Car Loan",     "currency": "INR", "balance": 450_000,   "interest_rate": 9.2,  "start_date": "Mar 2024", "end_date": "Feb 2028"},
    {"id": "l3", "name": "Personal Loan – SBI",  "type": "Personal Loan","currency": "INR", "balance": 120_000,   "interest_rate": 11.5, "start_date": "Jun 2025", "end_date": "May 2027"},
]

GOALS: list[dict] = [
    {
        "id": "g1",
        "name": "Retirement Fund",
        "currency": "INR",
        # PVGA-computed corpus: ₹50K/mo expenses, retire at 60 from age 30,
        # 25 yrs in retirement, 6% inflation, 7% post-retirement return ≈ ₹7.2 Cr
        "target": 72_000_000,
        "deadline": "Dec 2056",
        "monthly_expense": 50_000,
        "current_age": 30,
        "retirement_age": 60,
        "life_expectancy": 85,
        "inflation_rate": 6.0,
        "pre_return": 12.0,
        "post_return": 7.0,
    }
]
