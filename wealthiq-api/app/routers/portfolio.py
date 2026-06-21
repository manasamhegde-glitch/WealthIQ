import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import PortfolioSummary, GrowthPoint, Holding, HoldingCreate, HoldingUpdate
from app.data.mock_data import SUMMARY, GROWTH, HOLDINGS, LIABILITIES, CURRENCIES, enrich_holdings, enrich_liability

router = APIRouter()


def _enriched(holding_id: str) -> dict:
    """Return a single enriched holding (allocations recomputed across full portfolio)."""
    enriched = enrich_holdings(HOLDINGS)
    return next(h for h in enriched if h["id"] == holding_id)


@router.get("/currencies")
def get_currencies():
    return CURRENCIES


@router.get("/summary", response_model=PortfolioSummary)
def get_summary():
    enriched = enrich_holdings(HOLDINGS)
    total_assets = sum(h["value_usd"] for h in enriched)
    total_liab   = sum(enrich_liability(l)["balance_usd"] for l in LIABILITIES)
    net_worth    = total_assets - total_liab

    # Portfolio-level weighted average return (by allocation %)
    weighted_return = round(
        sum(h["change"] * h["allocation"] / 100 for h in enriched), 1
    ) if total_assets > 0 else 0.0

    return PortfolioSummary(
        user_name=SUMMARY.user_name,
        initials=SUMMARY.initials,
        current_funds=round(total_assets, 2),
        net_worth=round(net_worth, 2),
        total_liabilities=round(total_liab, 2),
        monthly_gain=round(total_assets * weighted_return / 100 / 12, 2),
        total_growth_pct=weighted_return,
        growth_since=SUMMARY.growth_since,
        monthly_return_pct=round(weighted_return / 12, 2),
        avg_return_pct=weighted_return,
    )


@router.get("/growth", response_model=list[GrowthPoint])
def get_growth():
    return GROWTH


@router.get("/holdings", response_model=list[Holding])
def get_holdings():
    return enrich_holdings(HOLDINGS)


@router.post("/holdings", response_model=Holding, status_code=201)
def create_holding(body: HoldingCreate):
    new = {"id": uuid.uuid4().hex[:8], **body.model_dump()}
    HOLDINGS.append(new)
    return _enriched(new["id"])


@router.put("/holdings/{holding_id}", response_model=Holding)
def update_holding(holding_id: str, body: HoldingUpdate):
    for i, h in enumerate(HOLDINGS):
        if h["id"] == holding_id:
            HOLDINGS[i] = {**h, **body.model_dump(exclude_none=True)}
            return _enriched(holding_id)
    raise HTTPException(status_code=404, detail="Holding not found")


@router.delete("/holdings/{holding_id}", status_code=204)
def delete_holding(holding_id: str):
    for i, h in enumerate(HOLDINGS):
        if h["id"] == holding_id:
            HOLDINGS.pop(i)
            return
    raise HTTPException(status_code=404, detail="Holding not found")
