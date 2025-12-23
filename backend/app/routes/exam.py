from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Exam, Class, Subject
from app.schema.schema import ExamCreate
from app.dependencies.role import require_roles
from app.model.model import Users, RoleEnum

router = APIRouter(prefix="/exam", tags=["Exam"])


@router.post("/", status_code=201)
def create_exam(data: ExamCreate,db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):
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

    return {"success": True,"message": "exam created successfully"}

@router.get("/class/{id}")
def find_exam_by_class(id: int, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):
    class_obj = db.query(Class).filter(Class.id == id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    exams = db.query(Exam).join(Subject).filter(Subject.class_id == id).all()
    if not exams:
        raise HTTPException(status_code=404, detail="No exams found for this class")
    return exams

@router.get("/subject/{id}")
def find_exam_by_subject(id: int, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):
    subject_obj = db.query(Subject).filter(Subject.id == id).first()
    if not subject_obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    exams = db.query(Exam).filter(Exam.subject_id == id).all()
    return exams


