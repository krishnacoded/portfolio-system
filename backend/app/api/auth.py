from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate
from app.core.database import get_db
from app.core.security import create_access_token, verify_password, hash_password
from app.services.user_service import UserService
from app.core.redis_client import rate_limit_check

router = APIRouter(prefix="/auth", tags=["Auth"])


# ──────────────────────────────────────────────
# LOGIN RATE LIMIT (5 attempts / minute / IP)
# ──────────────────────────────────────────────
async def _limit_login(request: Request):
    client_ip = request.headers.get(
        "X-Forwarded-For",
        request.client.host if request.client else "unknown"
    )
    client_ip = client_ip.split(",")[0].strip()

    key = f"rl:login:{client_ip}"

    try:
        allowed, _ = await rate_limit_check(key, 5, 60)
    except Exception:
        # Redis down → fail open (don’t block login)
        return

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later."
        )


# ──────────────────────────────────────────────
# LOGIN
# ──────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_limit_login),
):
    service = UserService(db)

    user = await service.get_by_email(data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        data={
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

    # basic password validation 
    if len(data.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long"
        )

    # hash password
    hashed_password = hash_password(data.password)

    # create user
    new_user = await service.create_user(data.email, hashed_password)

    token = create_access_token(
        data={
            "email": new_user.email,
            "role": new_user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }