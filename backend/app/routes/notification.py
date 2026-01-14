from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import cast, select, insert
from app.db.session import get_async_db
from app.model.model import Notification, notification_target_roles
from app.core.authen import get_current_user
from app.model.model import Users
from datetime import datetime
from app.schema.schema import NotificationCreate
from sqlalchemy.types import String

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/")
async def post_notification(payload: NotificationCreate,request: Request,db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(get_current_user)):
    notification = Notification(
    sender_id=current_user.id,
    title=payload.title,
    message=payload.message
    )

    db.add(notification)
    await db.flush()

    await db.execute(
        insert(notification_target_roles),
        [
            {
                "notification_id": notification.id,
                "role": role
            }
            for role in payload.target_roles
        ]
    )

    await db.commit()

    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast({
        "id": notification.id,
        "sender_id": current_user.id,
        "title": payload.title,
        "message": payload.message,
        "target_roles": payload.target_roles,
        "created_at": notification.created_at,
    })

    return notification

@router.get("/")
async def get_notifications(db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(get_current_user)):

    result = await db.execute(select(Notification).join(notification_target_roles,notification_target_roles.c.notification_id == Notification.id).where(notification_target_roles.c.role == cast(current_user.role.value, String)).order_by(Notification.created_at.desc()))

    return result.scalars().all()

