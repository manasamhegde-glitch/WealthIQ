from pydantic import BaseModel


class PortfolioSummary(BaseModel):
    user_name: str
    initials: str
    current_funds: float
    monthly_gain: float
    total_growth_pct: float
    growth_since: str
    monthly_return_pct: float
    avg_return_pct: float


class GrowthPoint(BaseModel):
    month: str
    value: float
    highlight: bool = False


class Holding(BaseModel):
    id: str
    name: str
    type: str       # Equity | Bond | ETF | Cash
    value: float
    change: float   # % change
    allocation: float


class Goal(BaseModel):
    id: str
    name: str
    current: float
    target: float
    deadline: str   # e.g. "Dec 2026"
    status: str     # active | completed | upcoming
