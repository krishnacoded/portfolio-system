from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# ── Engine ───────────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.db_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    future=True,  # ensures SQLAlchemy 2.0 behavior
)

# ── Session factory ──────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)

# ── Base class for all ORM models ────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency (SAFE + FLEXIBLE) ─────────────────────────────────────────────
from typing import AsyncGenerator

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

