from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.db.session import get_async_db
from app.model.model import (Timetable,DayEnum)
from app.core.authen import get_current_user
from app.model.model import Users

router = APIRouter(prefix="/timetable", tags=["Timetable"])


@router.post("/admin/slot", status_code=201)
async def create_slot_admin(
    teacher_id: int,
    class_id: int,
    subject_id: int,
    day: DayEnum,
    start_time: str,
    end_time: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: Users = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")

    slot = Timetable(
        teacher_id=teacher_id,
        class_id=class_id,
        subject_id=subject_id,
        day=day,
        start_time=start_time,
        end_time=end_time,
    )

    db.add(slot)

    try:
        await db.commit()
    except Exception:
        raise HTTPException(status_code=400,detail="Slot already exists for this class & time")

    await db.refresh(slot)
    return slot


@router.get("/admin/class")
async def get_timetable_by_class_admin(class_id: int ,day: DayEnum,db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")

    result = await db.execute(select(Timetable).where(Timetable.class_id == class_id,Timetable.day == day).order_by(Timetable.start_time))

    return result.scalars().all()


@router.get("/admin/teacher")
async def get_timetable_by_teacher_admin(teacher_id: int,day: DayEnum,db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")

    result = await db.execute(select(Timetable).where(Timetable.teacher_id == teacher_id,Timetable.day == day).order_by(Timetable.start_time))

    return result.scalars().all()
