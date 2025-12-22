from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Class, Teacher
from app.schema.schema import ClassCreate, ClassResponse

router = APIRouter(prefix="/class", tags=["Class"])


@router.post("/", status_code=201)
def create_class(data: ClassCreate, db: Session = Depends(get_db)):
    new_class = Class(
        classname=data.classname,
        section=data.section
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return {
        "message": "Class created successfully",
        "Class": ClassResponse.from_orm(new_class)
    }


@router.get("/")
def fetch_classes(db: Session = Depends(get_db)):
    classes = db.query(Class).all()
    return {
        "message": "Classes fetched successfully",
        "classes": classes
    }


@router.get("/{id}")
def fetch_class_by_id(id: int, db: Session = Depends(get_db)):
    class_by_id = db.query(Class).filter(Class.id == id).first()
    if not class_by_id:
        raise HTTPException(status_code=404, detail="Class not found")

    return {
        "message": "Class fetched successfully",
        "classById": class_by_id
    }


@router.delete("/{id}")
def delete_class(id: int, db: Session = Depends(get_db)):
    class_by_id = db.query(Class).filter(Class.id == id).first()
    if not class_by_id:
        raise HTTPException(status_code=404, detail="Class not found")

    db.delete(class_by_id)
    db.commit()

    return {
        "message": "Class deleted successfully",
        "classById": class_by_id
    }


@router.post("/assign/{teacher_id}")
def assign_class(
    teacher_id: int,
    classname: str,
    section: str,
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="teacher not found")

    class_obj = (
        db.query(Class)
        .filter(Class.classname == classname, Class.section == section)
        .first()
    )

    if not class_obj:
        raise HTTPException(status_code=404, detail="class not created")

    class_obj.teacher_id = teacher.id
    db.commit()

    return {
        "success": True,
        "message": "teacher assigned to class"
    }
