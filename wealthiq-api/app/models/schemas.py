from pydantic import BaseModel
from typing import Optional

SAVINGS_TYPES = [
    "NPS", "FD", "RD", "Bonds", "PF", "PPF", "EPF",
    "Mutual Funds", "Stocks", "Others",
]


class PortfolioSummary(BaseModel):
    user_name: str
    initials: str
    current_funds: float        # total assets in USD
    net_worth: float            # assets minus liabilities
    total_liabilities: float    # total liabilities in USD
    monthly_gain: float
    total_growth_pct: float     # weighted avg annual return %
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
    cost_basis: float = 0.0         # initial lumpsum invested (original currency)
    cost_basis_usd: float = 0.0     # computed on server


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
    cost_basis: float = 0.0


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
    cost_basis: Optional[float] = None


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
    target: float       # PVGA-computed corpus (original currency)
    target_usd: float   # computed on server
    deadline: str       # "Dec YYYY" derived from ages
    # PVGA inputs (stored so form can be re-populated)
    monthly_expense: float = 0.0
    current_age: int = 0
    retirement_age: int = 60
    life_expectancy: int = 85
    inflation_rate: float = 6.0
    pre_return: float = 12.0
    post_return: float = 7.0


class GoalCreate(BaseModel):
    name: str
    currency: str = "INR"
    target: float
    deadline: str
    monthly_expense: float = 0.0
    current_age: int = 0
    retirement_age: int = 60
    life_expectancy: int = 85
    inflation_rate: float = 6.0
    pre_return: float = 12.0
    post_return: float = 7.0


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None
    target: Optional[float] = None
    deadline: Optional[str] = None
    monthly_expense: Optional[float] = None
    current_age: Optional[int] = None
    retirement_age: Optional[int] = None
    life_expectancy: Optional[int] = None
    inflation_rate: Optional[float] = None
    pre_return: Optional[float] = None
    post_return: Optional[float] = None
