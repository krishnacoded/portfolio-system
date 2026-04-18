from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.redis_client import get_redis

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health check — DB + Redis")
async def health(db: AsyncSession = Depends(get_db)) -> dict:
    status = {"api": "ok", "database": "unknown", "redis": "unknown"}

    # PostgreSQL
    try:
        await db.execute(text("SELECT 1"))
        status["database"] = "ok"
    except Exception as exc:
        status["database"] = f"error: {exc}"

    # Redis
    try:
        redis = await get_redis()
        await redis.ping()
        status["redis"] = "ok"
    except Exception as exc:
        status["redis"] = f"error: {exc}"

    return status
