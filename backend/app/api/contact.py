from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.redis_client import rate_limit_check
from app.schemas.contact import ContactCreate, ContactResponse, SuccessResponse
from app.services.contact_service import ContactService
from app.core.mailer import send_contact_email

router = APIRouter(prefix="/contact", tags=["Contact"])

# Rate-limit constants
RATE_LIMIT = 5
RATE_WINDOW = 60


# ──────────────────────────────────────────────
# Helper: Extract client IP
# ──────────────────────────────────────────────
def _get_client_ip(request: Request) -> str:
    ip = request.headers.get(
        "X-Forwarded-For",
        request.client.host if request.client else "unknown"
    )
    return ip.split(",")[0].strip()


# ──────────────────────────────────────────────
# Rate limiting
# ──────────────────────────────────────────────
async def _check_rate_limit(request: Request) -> None:
    client_ip = _get_client_ip(request)
    key = f"rl:contact:{client_ip}"

    try:
        allowed, remaining = await rate_limit_check(key, RATE_LIMIT, RATE_WINDOW)
    except Exception:
        return  # fail-open

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Max {RATE_LIMIT} per minute.",
            headers={
                "Retry-After": str(RATE_WINDOW),
                "X-RateLimit-Remaining": "0",
            },
        )


# ──────────────────────────────────────────────
# Safe email wrapper 
# ──────────────────────────────────────────────
def _safe_send_email(name: str, email: str, message: str, phone: str | None):
    try:
        send_contact_email(name, email, message, phone)
    except Exception as e:
        # Don't crash background task
        print("Email failed:", e)


# ──────────────────────────────────────────────
# Endpoint
# ──────────────────────────────────────────────
@router.post(
    "",
    response_model=SuccessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact form message",
)
async def submit_contact(
    payload: ContactCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_check_rate_limit),
) -> SuccessResponse:

    client_ip = _get_client_ip(request)

    service = ContactService(db)
    submission = await service.create_submission(
        payload,
        ip_address=client_ip
    )

    #  non-blocking + safe email
    background_tasks.add_task(
        _safe_send_email,
        payload.name,
        payload.email,
        payload.message,
        payload.phone,
    )

    return SuccessResponse(
        message="Your message has been received. I'll get back to you soon!",
        data=ContactResponse.model_validate(submission),
    )