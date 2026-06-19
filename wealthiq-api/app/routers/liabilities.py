import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import Liability, LiabilityCreate, LiabilityUpdate
from app.data.mock_data import LIABILITIES, enrich_liability

router = APIRouter()


@router.get("", response_model=list[Liability])
def list_liabilities():
    return [enrich_liability(l) for l in LIABILITIES]


@router.post("", response_model=Liability, status_code=201)
def create_liability(body: LiabilityCreate):
    new = {"id": uuid.uuid4().hex[:8], **body.model_dump()}
    LIABILITIES.append(new)
    return enrich_liability(new)


@router.put("/{liability_id}", response_model=Liability)
def update_liability(liability_id: str, body: LiabilityUpdate):
    for i, l in enumerate(LIABILITIES):
        if l["id"] == liability_id:
            LIABILITIES[i] = {**l, **body.model_dump(exclude_none=True)}
            return enrich_liability(LIABILITIES[i])
    raise HTTPException(status_code=404, detail="Liability not found")


@router.delete("/{liability_id}", status_code=204)
def delete_liability(liability_id: str):
    for i, l in enumerate(LIABILITIES):
        if l["id"] == liability_id:
            LIABILITIES.pop(i)
            return
    raise HTTPException(status_code=404, detail="Liability not found")
