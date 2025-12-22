from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.model import Users
from app.schema.schema import UserCreate, UserResponse
import firebase_admin
from firebase_admin import auth

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(id_token: str, db: Session = Depends(get_db)):
    try:
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get("email")

        user = db.query(Users).filter(Users.email == email).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        return {
            "success": True,
            "message": "logged in successfully",
            "user": UserResponse.from_orm(user)
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")


@router.post("/signup")
def signup(data: UserCreate, id_token: str, db: Session = Depends(get_db)):
    try:
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get("email")

        if email != data.email:
            raise HTTPException(status_code=400, detail="Email mismatch")

        existing_user = db.query(Users).filter(Users.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exist")

        new_user = Users(
            email=email,
            password="firebase_auth",
            role=data.role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "success": True,
            "message": "signup in successfully",
            "user": UserResponse.from_orm(new_user)
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
