from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Parent, Users
from app.schema.schema import ParentCreate, ParentResponse
from app.dependencies.role import require_roles
from app.model.model import RoleEnum

router = APIRouter(prefix="/parent", tags=["Parent"])


@router.post("/{user_id}")
def create_parent(
    user_id: int,
    phone: str,
    db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))
):

    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_parent = db.query(Parent).filter(Parent.user_id == user_id).first()
    

    if existing_parent:
        raise HTTPException(status_code=400,detail="Parent already exists for this user")

    parent = Parent(
        user_id=user_id,
        phonenumber=phone
    )

    db.add(parent)
    db.commit()
    db.refresh(parent)
    return {"parent": parent, "message": "parent created successfully"}

@router.get("/{user_id}")
def get_parent(user_id: int, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER,RoleEnum.PARENT))):
    parent = db.query(Parent).filter(Parent.user_id == user_id).first()

    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    return parent
