from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_db
from app.model.model import Exam, Class, Subject, Users, RoleEnum
from app.schema.schema import ExamCreate
from app.dependencies.role import require_roles

router = APIRouter(prefix="/exam", tags=["Exam"])


@router.post("/", status_code=201)
async def create_exam(data: ExamCreate, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):

    result = await db.execute(select(Class).where(Class.classname == data.classname))
    class_obj = result.scalars().all()
    if not class_obj: 
        raise HTTPException(status_code=404, detail="class not found")
    result = await db.execute(select(Subject).where(Subject.name == data.subject))
    subject_obj = result.scalar_one_or_none()
    if not subject_obj: 
        raise HTTPException(status_code=404, detail="subject not found")
    exam = Exam(
        name=data.name,
        date=data.date,
        subject_id=subject_obj.id   
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    return {"success": True, "message": "exam created successfully"}


@router.get("/class/{id}")
async def find_exam_by_class(id: int, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):

    result = await db.execute(select(Class).where(Class.id == id))
    class_obj = result.scalar_one_or_none()
    if not class_obj: 
        raise HTTPException(status_code=404, detail="Class not found")
    result = await db.execute(
    select(Exam)
    .select_from(Subject)
    .join(Exam, Exam.subject_id == Subject.id)
    .where(Subject.class_id == id)
  )
    exams = result.scalars().all()
    if not exams: 
        raise HTTPException(status_code=404, detail="No exams found for this class")
    return exams


@router.get("/subject/{id}")
async def find_exam_by_subject(id: int, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):
    
    result = await db.execute(select(Subject).where(Subject.id == id))
    subject_obj = result.scalar_one_or_none()
    if not subject_obj: 
        raise HTTPException(status_code=404, detail="Subject not found")
    result = await db.execute(select(Exam).where(Exam.subject_id == id))
    exams = result.scalars().all()
    return exams
