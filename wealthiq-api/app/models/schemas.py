from pydantic import BaseModel
from typing import Optional

SAVINGS_TYPES = [
    "NPS", "FD", "RD", "Bonds", "PF", "PPF", "EPF",
    "Mutual Funds", "Stocks", "Others",
]


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
    type: str
    currency: str
    value: float        # original currency
    value_usd: float    # computed on server
    change: float
    allocation: float


class HoldingCreate(BaseModel):
    name: str
    type: str
    currency: str = "USD"
    value: float
    change: float


class HoldingUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    currency: Optional[str] = None
    value: Optional[float] = None
    change: Optional[float] = None


class Goal(BaseModel):
    id: str
    name: str
    currency: str
    target: float       # original currency
    target_usd: float   # computed on server
    deadline: str


class GoalCreate(BaseModel):
    name: str
    currency: str = "USD"
    target: float
    deadline: str


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None
    target: Optional[float] = None
    deadline: Optional[str] = None
