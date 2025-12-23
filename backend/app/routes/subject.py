from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Subject, Class, Teacher
from app.schema.schema import SubjectCreate
from app.dependencies.role import require_roles 
from app.model.model import Users, RoleEnum

router = APIRouter(tags=["Subject"])


@router.post("/", status_code=201)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    class_obj = db.query(Class).filter(Class.id == data.class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")

    teacher = db.query(Teacher).filter(Teacher.id == data.teacher_id, Teacher.is_active == True).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found or inactive")

    existing_subject = db.query(Subject).filter(Subject.name == data.name,Subject.class_id == data.class_id).first()
    if existing_subject:
        raise HTTPException(status_code=409, detail="Subject already exists for this class")

    subject = Subject(
        name=data.name,
        class_id=data.class_id,
        teacher_id=data.teacher_id
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return {"message": "Subject created successfully","subject": subject}


@router.post("/{teacher_id}/subjects")
def assign_subject_to_teacher(teacher_id: int, subject_name: str, max_classes: int = 4, db: Session = Depends(get_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id, Teacher.is_active == True).first()
    if not teacher: 
        raise HTTPException(status_code=404, detail="Teacher not found or inactive")
    
    current_count = db.query(Subject).filter(Subject.teacher_id == teacher.id).count()
    if current_count >= max_classes: 
        raise HTTPException(status_code=400, detail="Teacher already has maximum subjects")
    
    subjects = db.query(Subject).filter(Subject.name == subject_name, Subject.teacher_id.is_(None)).all()
    if not subjects: 
        raise HTTPException(status_code=404, detail="No available subjects found")
    
    assigned = 0; 
    [setattr(subj, "teacher_id", teacher.id) or (assigned := assigned + 1) for subj in subjects if current_count + assigned < max_classes]
    db.commit()
    return {"message": "Subject assigned successfully", "assigned_classes": assigned}

