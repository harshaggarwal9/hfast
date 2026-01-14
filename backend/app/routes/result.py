from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_db
from app.model.model import Result, Exam, Student, Subject, Users, RoleEnum
from app.dependencies.role import require_roles

router = APIRouter(prefix="/result", tags=["Result"])


@router.post("/{exam_id}", status_code=201)
async def create_result(exam_id: int, marks: int, rollNumber: str, subjects: str, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):

    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    if not exam: 
        raise HTTPException(status_code=404, detail="exam not found")
    result = await db.execute(select(Student).where(Student.rollnumber == rollNumber))
    student = result.scalar_one_or_none()
    if not student: 
        raise HTTPException(status_code=404, detail="student not found")
    result = await db.execute(select(Subject).where(Subject.name == subjects))
    subject = result.scalar_one_or_none()
    if not subject: 
        raise HTTPException(status_code=404, detail="subject not found")
    if subject.class_id != student.class_id: raise HTTPException(status_code=400, detail="Student is not registered for this exam")
    result_obj = Result(marks=marks, student_id=student.id, subject_id=subject.id, exam_id=exam.id)
    db.add(result_obj)
    await db.commit()
    await db.refresh(result_obj)
    return {"message": "result created successfully", "result": result_obj}


@router.get("/student/{student_id}")
async def fetch_results(student_id: int, db: AsyncSession = Depends(get_async_db), current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.PARENT, RoleEnum.STUDENT))):

    result = await db.execute(select(Result).where(Result.student_id == student_id))
    results = result.scalars().all()
    if not results: 
        raise HTTPException(status_code=404, detail="no student found with this id")
    return results
