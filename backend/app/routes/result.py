from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Result, Exam, Student, Subject

router = APIRouter(prefix="/result", tags=["Result"])


@router.post("/{exam_id}", status_code=201)
def create_result(
    exam_id: int,
    marks: int,
    rollNumber: str,
    subjects: str,
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="exam not found")

    student = db.query(Student).filter(Student.rollnumber == rollNumber).first()
    if not student:
        raise HTTPException(status_code=404, detail="student not found")

    subject = db.query(Subject).filter(Subject.name == subjects).first()
    if not subject:
        raise HTTPException(status_code=404, detail="subject not found")

    if subject.class_id != student.class_id:
        raise HTTPException(status_code=400, detail="Student is not registered for this exam")

    result = Result(
        marks=marks,
        student_id=student.id,
        subject_id=subject.id,
        exam_id=exam.id
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "message": "result created successfully",
        "result": result
    }


@router.get("/student/{student_id}")
def fetch_results(student_id: int, db: Session = Depends(get_db)):
    results = db.query(Result).filter(Result.student_id == student_id).all()
    if not results:
        raise HTTPException(status_code=404, detail="no student found with this id")

    return results
