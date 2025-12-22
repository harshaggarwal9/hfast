from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Exam, Class, Subject
from app.schema.schema import ExamCreate

router = APIRouter(prefix="/exam", tags=["Exam"])


@router.post("/", status_code=201)
def create_exam(
    data: ExamCreate,
    db: Session = Depends(get_db)
):
    class_obj = db.query(Class).filter(Class.classname == data.className).all()
    if not class_obj:
        raise HTTPException(status_code=404, detail="class not found")

    subject_obj = db.query(Subject).filter(Subject.name == data.subject).first()
    if not subject_obj:
        raise HTTPException(status_code=404, detail="subject not found")

    exam = Exam(
        name=data.name,
        date=data.date
    )

    db.add(exam)
    db.commit()
    db.refresh(exam)

    return {
        "success": True,
        "message": "exam created successfully"
    }



@router.get("/class/{id}")
def find_exam_by_class(id: int, db: Session = Depends(get_db)):
    class_obj = db.query(Class).filter(Class.id == id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="class not found")

    subjects = db.query(Subject).filter(Subject.class_id == class_obj.id).all()
    subject_ids = [s.id for s in subjects]

    exams = (
        db.query(Exam)
        .join(Subject, Subject.id.in_(subject_ids))
        .all()
    )

    return exams


@router.get("/subject/{id}")
def find_exam_by_subject(id: int, db: Session = Depends(get_db)):
    subject_obj = db.query(Subject).filter(Subject.id == id).first()
    if not subject_obj:
        raise HTTPException(status_code=404, detail="subject not found")

    exams = db.query(Exam).all()
    return exams
