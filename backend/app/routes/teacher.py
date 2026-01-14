from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_db
from app.model.model import Teacher, Users, RoleEnum
from app.dependencies.role import require_roles

router = APIRouter(prefix="/teacher", tags=["Teacher"])


@router.post("/{user_id}", status_code=201)
async def create_teacher(user_id: int, experience: int, qualifications: str, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalar_one_or_none()
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")
    result = await db.execute(select(Teacher).where(Teacher.user_id == user_id))
    existing_teacher = result.scalar_one_or_none()
    if existing_teacher: 
        raise HTTPException(status_code=409, detail="Teacher already exists for this user")
    teacher = Teacher(user_id=user_id, experience=experience, qualification=qualifications)
    db.add(teacher)
    await db.commit()
    await db.refresh(teacher)
    return {"message": "Teacher created successfully", "teacher": teacher}


@router.get("/{id}")
async def fetch_teacher(id: int, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):
    result = await db.execute(select(Teacher).where(Teacher.id == id))
    teacher = result.scalar_one_or_none()
    if not teacher: 
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.put("/{user_id}/deactivate")
async def deactivate_teacher(user_id: int, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    result = await db.execute(select(Teacher).where(Teacher.user_id == user_id))
    teacher = result.scalar_one_or_none()
    if not teacher: 
        raise HTTPException(status_code=404, detail="Teacher not found")
    teacher.is_active = False
    await db.commit()
    return {"message": "Teacher deactivated successfully"}

