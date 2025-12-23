from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Teacher, Users
from app.dependencies.role import require_roles
from app.model.model import RoleEnum

router = APIRouter(prefix="/teacher", tags=["Teacher"])


@router.post("/{user_id}", status_code=201)
def create_teacher(user_id: int, experience: int, qualifications: str, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    user = db.query(Users).filter(Users.id == user_id).first()
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")

    existing_teacher = db.query(Teacher).filter(Teacher.user_id == user_id).first()
    if existing_teacher: 
        raise HTTPException(status_code=409, detail="Teacher already exists for this user")

    teacher = Teacher(user_id=user_id, experience=experience, qualification=qualifications)
    db.add(teacher); 
    db.commit(); 
    db.refresh(teacher)
    return {"message": "Teacher created successfully", "teacher": teacher}



@router.get("/{id}")
def fetch_teacher(id: int, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.TEACHER))):
    teacher = db.query(Teacher).filter(Teacher.id == id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return teacher

@router.put("/{user_id}/deactivate")
def deactivate_teacher(user_id: int, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    teacher = db.query(Teacher).filter(Teacher.user_id == user_id).first()
    if not teacher: raise HTTPException(status_code=404, detail="Teacher not found")
    teacher.is_active = False
    db.commit()
    return {"message": "Teacher deactivated successfully"}


