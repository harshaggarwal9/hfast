from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Parent, Users
from app.schema.schema import ParentCreate, ParentResponse

router = APIRouter(prefix="/parent", tags=["Parent"])


@router.post("/{user_id}")
def create_parent(user_id: int, phone: str, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    parent = Parent(
        user_id=user.id,
        phonenumber=phone
    )

    db.add(parent)
    db.commit()
    db.refresh(parent)

    return {
        "success": True,
        "message": "parent created successfully"
    }


@router.get("/{id}")
def get_parent(id: int, db: Session = Depends(get_db)):
    parent = db.query(Parent).filter(Parent.id == id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="parent not found")

    return parent
