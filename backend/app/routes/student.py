from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_db
from app.model.model import Student, Users, Class, Parent, RoleEnum
from app.dependencies.role import require_roles

router = APIRouter(prefix="/student", tags=["Student"])


@router.post("/{user_id}", status_code=201)
async def create_student(user_id: int, RollNumber: str, className: str, section: str, phoneNumber: str, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):

    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalar_one_or_none()
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")
    result = await db.execute(select(Parent).where(Parent.phonenumber == phoneNumber))
    parent = result.scalar_one_or_none()
    if not parent: 
        raise HTTPException(status_code=404, detail="parent not exist first create parent")
    result = await db.execute(select(Class).where(Class.classname == className, Class.section == section))
    class_data = result.scalar_one_or_none()
    if not class_data: 
        raise HTTPException(status_code=404, detail="class not exist first create class")
    student = Student(user_id=user.id, rollnumber=RollNumber, class_id=class_data.id, parent_id=parent.id)
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return {"student": student, "message": "student created successfully"}


@router.get("/{id}")
async def get_student(id: int, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Student).where(Student.id == id))
    student = result.scalar_one_or_none()
    if not student: 
        raise HTTPException(status_code=404, detail="user not found")
    return student


@router.delete("/{id}")
async def delete_student(id: int, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):

    result = await db.execute(select(Student).where(Student.id == id, Student.is_active == True))
    student = result.scalar_one_or_none()
    if not student: 
        raise HTTPException(status_code=404, detail="Student not found")
    student.is_active = False
    await db.commit()
    return {"message": "Student deactivated successfully"}
