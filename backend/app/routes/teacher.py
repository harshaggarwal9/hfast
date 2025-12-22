from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Teacher, Users

router = APIRouter(prefix="/teacher", tags=["Teacher"])


@router.post("/{user_id}", status_code=201)
def create_teacher(
    user_id: int,
    experience: int,
    qualifications: str,
    db: Session = Depends(get_db)
):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    teacher = Teacher(
        user_id=user.id,
        experience=experience,
        qualification=qualifications
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return {
        "message": "Teacher created successfully",
        "teacher": teacher
    }


@router.get("/{id}")
def fetch_teacher(id: int, db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.id == id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return teacher
