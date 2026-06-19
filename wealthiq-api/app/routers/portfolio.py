import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import PortfolioSummary, GrowthPoint, Holding, HoldingCreate, HoldingUpdate
from app.data.mock_data import SUMMARY, GROWTH, HOLDINGS, CURRENCIES, enrich_holdings

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
    return SUMMARY


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
