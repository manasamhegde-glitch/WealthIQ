from fastapi import APIRouter, HTTPException
from app.models.schemas import Goal
from app.data.mock_data import GOALS

router = APIRouter()


@router.get("", response_model=list[Goal])
def list_goals():
    return GOALS


@router.get("/{goal_id}", response_model=Goal)
def get_goal(goal_id: str):
    goal = next((g for g in GOALS if g.id == goal_id), None)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal
