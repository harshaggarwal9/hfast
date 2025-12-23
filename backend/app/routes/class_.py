from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Class, Teacher
from app.schema.schema import ClassCreate, ClassResponse
from app.dependencies.role import require_roles
from app.model.model import Users, RoleEnum

router = APIRouter(prefix="/class", tags=["Class"])


@router.post("/", status_code=201)
def create_class(data: ClassCreate, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))): 
    existing_class = db.query(Class).filter(Class.classname == data.classname, Class.section == data.section).first(); 
    if existing_class: 
        raise HTTPException(status_code=409, detail="Class already exists"); 
    new_class = Class(classname=data.classname, section=data.section); 
    db.add(new_class); 
    db.commit(); 
    db.refresh(new_class); 
    return {"message": "Class created successfully", "class": ClassResponse.from_orm(new_class)}


@router.get("/")
def fetch_classes(db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    classes = db.query(Class).all()
    return {"message": "Classes fetched successfully","classes": classes}


@router.get("/{id}")
def fetch_class_by_id(id: int, db: Session = Depends(get_db)):
    class_by_id = db.query(Class).filter(Class.id == id).first()
    if not class_by_id:
        raise HTTPException(status_code=404, detail="Class not found")

    return {"message": "Class fetched successfully","classById": class_by_id}


@router.delete("/{id}")
def delete_class(id: int, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    class_by_id = db.query(Class).filter(Class.id == id).first()
    if not class_by_id:
        raise HTTPException(status_code=404, detail="Class not found")

    db.delete(class_by_id)
    db.commit()

    return {"message": "Class deleted successfully","classById": class_by_id}


@router.post("/assign/{teacher_id}")
def assign_class(teacher_id: int, classname: str, section: str, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id, Teacher.is_active == True).first()
    if not teacher: raise HTTPException(status_code=404, detail="Teacher not found or inactive")

    class_obj = db.query(Class).filter(Class.classname == classname, Class.section == section).first()
    if not class_obj: raise HTTPException(status_code=404, detail="Class not found")

    if class_obj.teacher_id is not None:
        raise HTTPException(status_code=409, detail="Class already assigned to a teacher")

    class_obj.teacher_id = teacher.id
    db.commit()

    return {"success": True, "message": "Teacher assigned to class successfully"}

