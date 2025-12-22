from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Student, Users, Class, Parent

router = APIRouter(prefix="/student", tags=["Student"])


@router.post("/{user_id}", status_code=201)
def create_student(
    user_id: int,
    RollNumber: str,
    className: str,
    section: str,
    phoneNumber: str,
    db: Session = Depends(get_db)
):
    parent = db.query(Parent).filter(Parent.phonenumber == phoneNumber).first()
    if not parent:
        raise HTTPException(status_code=404, detail="parent not exist first create parent")

    class_data = (
        db.query(Class)
        .filter(Class.classname == className, Class.section == section)
        .first()
    )
    if not class_data:
        raise HTTPException(status_code=404, detail="class not exist first create class")

    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    student = Student(
        user_id=user.id,
        rollnumber=RollNumber,
        class_id=class_data.id,
        parent_id=parent.id
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return {
        "student": student,
        "message": "student created successfully"
    }


@router.get("/{id}")
def get_student(id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="user not found")

    return student


@router.delete("/{id}")
def delete_student(id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="student not found")

    db.delete(student)
    db.commit()

    return {
        "message": "Student deleted successfully",
        "StudentById": student
    }
