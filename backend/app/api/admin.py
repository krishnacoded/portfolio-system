from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin  # 🔥 USE THIS
from app.schemas.contact import ContactResponse
from app.services.contact_service import ContactService

router = APIRouter(prefix="/admin", tags=["Admin"])


# ──────────────────────────────────────────────────────────────
# Protected: List contacts (ADMIN ONLY)
# ──────────────────────────────────────────────────────────────
@router.get(
    "/contact",
    response_model=list[ContactResponse],
    summary="[Admin] List all contact submissions",
)
async def list_contacts(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_admin),  # 🔥 FIXED
) -> list[ContactResponse]:

    service = ContactService(db)
    submissions = await service.get_all_submissions(skip=skip, limit=limit)
    return [ContactResponse.model_validate(s) for s in submissions]


# ──────────────────────────────────────────────────────────────
# Protected: Count contacts (ADMIN ONLY)
# ──────────────────────────────────────────────────────────────
@router.get(
    "/contact/count",
    summary="[Admin] Count all contact submissions",
)
async def count_contacts(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_admin),  
) -> dict:

    service = ContactService(db)
    count = await service.get_submission_count()
    return {"total": count}