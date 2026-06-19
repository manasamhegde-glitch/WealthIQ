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


CONTRIBUTION_FREQS = ["None", "Monthly", "Yearly"]


class Holding(BaseModel):
    id: str
    name: str
    type: str
    currency: str
    value: float            # original currency
    value_usd: float        # computed on server
    change: float
    allocation: float
    start_date: str = ""
    maturity_date: str = ""
    contribution: float = 0.0       # periodic contribution in original currency
    contribution_freq: str = "None" # None | Monthly | Yearly
    contribution_usd: float = 0.0   # computed on server


class HoldingCreate(BaseModel):
    name: str
    type: str
    currency: str = "USD"
    value: float
    change: float
    start_date: str = ""
    maturity_date: str = ""
    contribution: float = 0.0
    contribution_freq: str = "None"


class HoldingUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    currency: Optional[str] = None
    value: Optional[float] = None
    change: Optional[float] = None
    start_date: Optional[str] = None
    maturity_date: Optional[str] = None
    contribution: Optional[float] = None
    contribution_freq: Optional[str] = None


LIABILITY_TYPES = [
    "Mortgage", "Home Loan", "Car Loan", "Personal Loan",
    "Education Loan", "Credit Card EMI", "Business Loan", "Others",
]


class Liability(BaseModel):
    id: str
    name: str
    type: str
    currency: str
    balance: float          # original currency
    balance_usd: float      # computed on server
    interest_rate: float    # annual %
    start_date: str
    end_date: str


class LiabilityCreate(BaseModel):
    name: str
    type: str
    currency: str = "USD"
    balance: float
    interest_rate: float = 0.0
    start_date: str = ""
    end_date: str = ""


class LiabilityUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    currency: Optional[str] = None
    balance: Optional[float] = None
    interest_rate: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


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
