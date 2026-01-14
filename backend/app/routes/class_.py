from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_db
from app.model.model import Class, Teacher, Users, RoleEnum
from app.schema.schema import ClassCreate, ClassResponse
from app.dependencies.role import require_roles

router = APIRouter(prefix="/class", tags=["Class"])


@router.post("/", status_code=201)
async def create_class(data: ClassCreate, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    result = await db.execute(select(Class).where(Class.classname == data.classname, Class.section == data.section))
    existing_class = result.scalar_one_or_none()
    if existing_class: 
        raise HTTPException(status_code=409, detail="Class already exists")
    new_class = Class(classname=data.classname, section=data.section)
    db.add(new_class)
    await db.commit()
    await db.refresh(new_class)
    return {"message": "Class created successfully", "class": ClassResponse.from_orm(new_class)}


@router.get("/")
async def fetch_classes(db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Class))
    classes = result.scalars().all()
    return {"message": "Classes fetched successfully", "classes": classes}


@router.get("/{id}")
async def fetch_class_by_id(id: int, db: AsyncSession = Depends(get_async_db)):

    result = await db.execute(select(Class).where(Class.id == id))
    class_by_id = result.scalar_one_or_none()
    if not class_by_id: 
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class fetched successfully", "classById": class_by_id}


@router.delete("/{id}")
async def delete_class(id: int, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Class).where(Class.id == id))
    class_by_id = result.scalar_one_or_none()
    if not class_by_id: 
        raise HTTPException(status_code=404, detail="Class not found")
    await db.delete(class_by_id)
    await db.commit()
    return {"message": "Class deleted successfully", "classById": class_by_id}


@router.post("/assign/{teacher_id}")
async def assign_class(teacher_id: int, classname: str, section: str, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id, Teacher.is_active == True))
    teacher = result.scalar_one_or_none()
    if not teacher: 
        raise HTTPException(status_code=404, detail="Teacher not found or inactive")
    result = await db.execute(select(Class).where(Class.classname == classname, Class.section == section))
    class_obj = result.scalar_one_or_none()
    if not class_obj: 
        raise HTTPException(status_code=404, detail="Class not found")
    if class_obj.teacher_id is not None: 
        raise HTTPException(status_code=409, detail="Class already assigned to a teacher")
    class_obj.teacher_id = teacher.id
    await db.commit()
    return {"success": True, "message": "Teacher assigned to class successfully"}
