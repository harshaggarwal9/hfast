from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from firebase_admin import auth as firebase_auth
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_async_db
from app.model.model import Users as users

security = HTTPBearer()

async def get_current_user(credentials=Depends(security),db: AsyncSession = Depends(get_async_db)):
    token = credentials.credentials

    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    firebase_uid = decoded.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    stmt = select(users).where(users.firebase_uid == firebase_uid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
