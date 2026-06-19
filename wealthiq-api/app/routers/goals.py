import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import Goal, GoalCreate, GoalUpdate
from app.data.mock_data import GOALS, enrich_goal

router = APIRouter()


@router.get("", response_model=list[Goal])
def list_goals():
    return [enrich_goal(g) for g in GOALS]


@router.get("/{goal_id}", response_model=Goal)
def get_goal(goal_id: str):
    g = next((g for g in GOALS if g["id"] == goal_id), None)
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    return enrich_goal(g)


@router.post("", response_model=Goal, status_code=201)
def create_goal(body: GoalCreate):
    new = {"id": uuid.uuid4().hex[:8], **body.model_dump()}
    GOALS.append(new)
    return enrich_goal(new)


@router.put("/{goal_id}", response_model=Goal)
def update_goal(goal_id: str, body: GoalUpdate):
    for i, g in enumerate(GOALS):
        if g["id"] == goal_id:
            GOALS[i] = {**g, **body.model_dump(exclude_none=True)}
            return enrich_goal(GOALS[i])
    raise HTTPException(status_code=404, detail="Goal not found")


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: str):
    for i, g in enumerate(GOALS):
        if g["id"] == goal_id:
            GOALS.pop(i)
            return
    raise HTTPException(status_code=404, detail="Goal not found")
