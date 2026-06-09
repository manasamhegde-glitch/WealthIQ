from fastapi import APIRouter
from app.models.schemas import PortfolioSummary, GrowthPoint, Holding
from app.data.mock_data import SUMMARY, GROWTH, HOLDINGS

router = APIRouter()


@router.get("/summary", response_model=PortfolioSummary)
def get_summary():
    return SUMMARY


@router.get("/growth", response_model=list[GrowthPoint])
def get_growth():
    return GROWTH


@router.get("/holdings", response_model=list[Holding])
def get_holdings():
    return HOLDINGS
