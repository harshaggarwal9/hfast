from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Subject, Class, Teacher
from app.schema.schema import SubjectCreate

router = APIRouter(tags=["Subject"])


@router.post("/", status_code=201)
def create_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db)
):
    class_obj = db.query(Class).filter(Class.id == data.class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="class not found")

    subject = Subject(
        name=data.name,
        class_id=data.class_id,
        teacher_id=data.teacher_id
    )

    db.add(subject)
    db.commit()
    db.refresh(subject)

    return {
        "message": "Subject created successfully",
        "subject": subject
    }


@router.post("/assign/{teacher_id}")
def assign_subject_to_teacher(
    teacher_id: int,
    subject_name: str,
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    subjects = db.query(Subject).filter(
        Subject.name == subject_name,
        Subject.teacher_id.is_(None)
    ).all()

    if not subjects:
        raise HTTPException(status_code=404, detail="No available subjects found")

    max_classes = 4
    assigned = 0

    for subj in subjects:
        if assigned >= max_classes:
            break
        subj.teacher_id = teacher.id
        assigned += 1

    db.commit()

    return {
        "message": "Subject assigned to teacher successfully",
        "assigned_classes": assigned
    }
