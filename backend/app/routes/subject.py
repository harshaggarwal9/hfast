from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_db
from app.model.model import Subject, Class, Teacher, Users, RoleEnum
from app.schema.schema import SubjectCreate
from app.dependencies.role import require_roles

router = APIRouter(tags=["Subject"])


@router.post("/", status_code=201)
async def create_subject(data: SubjectCreate, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    result = await db.execute(select(Class).where(Class.id == data.class_id))
    class_obj = result.scalar_one_or_none()
    if not class_obj: 
        raise HTTPException(status_code=404, detail="Class not found")
    result = await db.execute(select(Teacher).where(Teacher.id == data.teacher_id, Teacher.is_active == True))
    teacher = result.scalar_one_or_none()
    if not teacher: 
        raise HTTPException(status_code=404, detail="Teacher not found or inactive")
    result = await db.execute(select(Subject).where(Subject.name == data.name, Subject.class_id == data.class_id))
    existing_subject = result.scalar_one_or_none()
    if existing_subject: 
        raise HTTPException(status_code=409, detail="Subject already exists for this class")
    subject = Subject(name=data.name, class_id=data.class_id, teacher_id=data.teacher_id)
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return {"message": "Subject created successfully", "subject": subject}


@router.post("/{teacher_id}/subjects")
async def assign_subject_to_teacher(teacher_id: int, subject_name: str, max_classes: int = 4, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id, Teacher.is_active == True))
    teacher = result.scalar_one_or_none()
    if not teacher: 
        raise HTTPException(status_code=404, detail="Teacher not found or inactive")
    result = await db.execute(select(func.count()).select_from(Subject).where(Subject.teacher_id == teacher.id))
    current_count = result.scalar_one()

    if current_count >= max_classes: 
        raise HTTPException(status_code=400, detail="Teacher already has maximum subjects")
    result = await db.execute(select(Subject).where(Subject.name == subject_name, Subject.teacher_id.is_(None)))
    subjects = result.scalars().all()
    if not subjects: 
        raise HTTPException(status_code=404, detail="No available subjects found")
    assigned = 0
    for subj in subjects:
        if current_count + assigned >= max_classes: 
            break
        subj.teacher_id = teacher.id
        assigned += 1
    await db.commit()
    return {"message": "Subject assigned successfully", "assigned_classes": assigned}
