from app.models.schemas import PortfolioSummary, GrowthPoint, Holding, Goal

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

HOLDINGS: list[Holding] = [
    Holding(id="h1", name="Nifty 50 ETF",      type="ETF",    value=18200, change=3.2,  allocation=42),
    Holding(id="h2", name="HDFC Bank",          type="Equity", value=9400,  change=1.8,  allocation=22),
    Holding(id="h3", name="Govt Bond 2031",     type="Bond",   value=7650,  change=0.4,  allocation=18),
    Holding(id="h4", name="US S&P 500 Index",   type="ETF",    value=5300,  change=-0.6, allocation=12),
    Holding(id="h5", name="Liquid Fund",         type="Cash",   value=2300,  change=0.1,  allocation=6),
]

GOALS: list[Goal] = [
    Goal(id="g1", name="Emergency Fund",       current=42850, target=60000, deadline="Dec 2026", status="active"),
    Goal(id="g2", name="Home Down Payment",    current=10000, target=150000, deadline="Dec 2028", status="active"),
    Goal(id="g3", name="Retirement Corpus",    current=5000,  target=2000000, deadline="Dec 2045", status="active"),
]
