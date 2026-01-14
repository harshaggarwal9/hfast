from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.db.session import get_async_db
from app.model.model import Users, Class, Fee, FeeStatusEnum, RoleEnum
from app.dependencies.role import require_roles
from app.utils.mail import send_template_mail
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/pending-users")
async def get_pending_users(db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Users).where(Users.is_verified == False))
    users = result.scalars().all()
    return users

@router.post("/approve-user")
async def approve_user(user_id: int,action: str,db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if action == "approve":
        user.is_verified = True
        await db.commit()

        try:
            await send_template_mail(
                to=user.email,
                subject="🎉 Your ERP Account Has Been Approved!",
                template_data={
                    "name": user.full_name,
                    "portalLink": "https://mjerp.onrender.com/",
                    "year": datetime.utcnow().year,
                }
            )
        except Exception:
            return {"message": "User approved, but email failed to send."}

        return {"message": "User approved and notified."}

    elif action == "reject":
        await db.delete(user)
        await db.commit()
        return {"message": "User rejected and deleted."}

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

@router.get("/total-users")
async def total_users(db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(func.count()).select_from(Users).where(Users.is_verified == True))
    count = result.scalar()
    return {"count": count}

@router.get("/total-classes")
async def total_classes(db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(func.count()).select_from(Class))
    count = result.scalar()
    return {"count": count}

@router.get("/total-fees-collected")
async def total_fees_collected(db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):

    result = await db.execute(select(func.sum(Fee.amount)).where(Fee.status == FeeStatusEnum.Paid))
    total = result.scalar() or 0
    return {"amount": total}


@router.get("/total-pending-users")
async def total_pending_users(db: AsyncSession = Depends(get_async_db),current_user: Users = Depends(require_roles(RoleEnum.ADMIN))):
    
    result = await db.execute(select(func.count()).select_from(Users).where(Users.is_verified == False))
    count = result.scalar()
    return {"count": count}

 