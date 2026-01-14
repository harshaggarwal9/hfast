from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from firebase_admin import auth as firebase_auth
from app.db.session import get_async_db
from app.model.model import Users as users, AuthProviderEnum, UserAuthProviders
from app.schema.schema import UserCreate

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()


def verify_firebase_token(token: str):
    return firebase_auth.verify_id_token(token)


@router.post("/register")
async def register_user(user: UserCreate, credentials=Depends(security), db: AsyncSession = Depends(get_async_db)):
    token = credentials.credentials
    decoded = verify_firebase_token(token)
    firebase_uid = decoded["uid"]
    email = decoded.get("email")
    email_verified = decoded.get("email_verified", False)
    if not email: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not found in Firebase token")
    raw_provider = decoded.get("firebase", {}).get("sign_in_provider", "password")
    provider_enum = AuthProviderEnum.google if raw_provider == "google.com" else AuthProviderEnum.password

    # 🔹 Step 1: Extract name only from Google
    if provider_enum == AuthProviderEnum.google:
        full_name = decoded.get("name") or decoded.get("display_name")
    else:
        full_name = None

    # 🔹 Step 2: Fetch user (may or may not exist)
    result = await db.execute(
        select(users).where(users.firebase_uid == firebase_uid)
    )
    user_db = result.scalar_one_or_none()

    # 🔹 Step 3: Fallback to DB name for password users
    if user_db and not full_name:
        full_name = user_db.full_name.strip() if user_db.full_name else None

    # 🔹 Step 4: Enforce full_name
    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="full_name is required"
        )

    # 🔹 Step 5: Create or update user
    if not user_db:
        user_db = users(
            firebase_uid=firebase_uid,
            email=email,
            full_name=full_name,
            is_verified=email_verified,
            auth_provider=provider_enum,
        )
        db.add(user_db)
        await db.commit()
        await db.refresh(user_db)
    else:
        updated = False

        if not user_db.full_name and full_name:
            user_db.full_name = full_name
            updated = True

        if email_verified and not user_db.is_verified:
            user_db.is_verified = True
            updated = True

        if user_db.auth_provider != provider_enum:
            user_db.auth_provider = provider_enum
            updated = True

        if updated:
            await db.commit()
            await db.refresh(user_db)

    result = await db.execute(select(UserAuthProviders).where(UserAuthProviders.user_id == user.id, UserAuthProviders.provider == provider_enum))
    provider_row = result.scalar_one_or_none()
    if not provider_row:
        db.add(UserAuthProviders(user_id=user.id, provider=provider_enum, provider_uid=firebase_uid))
        await db.commit()
    return {"message": "User registered successfully", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "provider": provider_enum.value}}


@router.post("/login")
async def login_user(credentials=Depends(security), db: AsyncSession = Depends(get_async_db)):
    token = credentials.credentials
    try:
        decoded = verify_firebase_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired Firebase token")
    firebase_uid = decoded["uid"]
    email = decoded.get("email")
    email_verified = decoded.get("email_verified", False)
    if not email: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not found in Firebase token")
    raw_provider = decoded.get("firebase", {}).get("sign_in_provider", "password")
    provider_enum = AuthProviderEnum.google if raw_provider == "google.com" else AuthProviderEnum.password
    result = await db.execute(select(users).where(users.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()
    if not user: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not registered. Please register first.")
    updated = False
    if email_verified and not user.is_verified: user.is_verified, updated = True, True
    if user.auth_provider != provider_enum: user.auth_provider, updated = provider_enum, True
    if updated:
        await db.commit()
        await db.refresh(user)
    result = await db.execute(select(UserAuthProviders).where(UserAuthProviders.user_id == user.id, UserAuthProviders.provider == provider_enum))
    provider_row = result.scalar_one_or_none()
    if not provider_row:
        db.add(UserAuthProviders(user_id=user.id, provider=provider_enum, provider_uid=firebase_uid))
        await db.commit()
    return {"message": "Login successful", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "provider": provider_enum.value, "is_verified": user.is_verified}}
