from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_db
from app.model.model import Parent, Users, RoleEnum
from app.dependencies.role import require_roles

router = APIRouter(prefix="/parent", tags=["Parent"])


@router.post("/{user_id}")
async def create_parent(user_id: int, phone: str, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):

    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalar_one_or_none()
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")
    result = await db.execute(select(Parent).where(Parent.user_id == user_id))
    existing_parent = result.scalar_one_or_none()
    if existing_parent: 
        raise HTTPException(status_code=400, detail="Parent already exists for this user")
    parent = Parent(user_id=user_id, phonenumber=phone)
    db.add(parent)
    await db.commit()
    await db.refresh(parent)
    return {"parent": parent, "message": "parent created successfully"}


@router.get("/{user_id}")
async def get_parent(user_id: int, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.PARENT))):

    result = await db.execute(select(Parent).where(Parent.user_id == user_id))
    parent = result.scalar_one_or_none()
    if not parent: 
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent
