from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate
from app.core.database import get_db
from app.core.security import create_access_token, verify_password, hash_password
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])


# ──────────────────────────────────────────────
# LOGIN
# ──────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = UserService(db)

    user = await service.get_by_email(data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        subject={
            "email": user.email,
            "role": user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ──────────────────────────────────────────────
# SIGNUP (REGISTER + AUTO LOGIN)
# ──────────────────────────────────────────────
@router.post("/signup", response_model=TokenResponse)
async def signup(data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = UserService(db)

    # check if user already exists
    existing_user = await service.get_by_email(data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # hash password
    hashed_password = hash_password(data.password)

    # create user
    new_user = await service.create_user(data.email, hashed_password)

    token = create_access_token(
        subject={
            "email": new_user.email,
            "role": new_user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }