from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis_client import close_redis
from app.api import api_router
from app.api.auth import router as auth_router

# Import all models so Base.metadata knows about them
import app.models  # noqa: F401


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"✅  {settings.APP_NAME} started | env={settings.APP_ENV}")
    yield
    # Shutdown
    await close_redis()
    await engine.dispose()
    print("🛑  Server shut down cleanly.")


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        description="Portfolio backend API — contact form, JWT auth, Redis caching.",
        docs_url="/api/docs" if settings.DEBUG else None,
        redoc_url="/api/redoc" if settings.DEBUG else None,
        openapi_url="/api/openapi.json" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # ── Middleware ────────────────────────────────────────────────────────────

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if settings.APP_ENV == "production":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["yourdomain.com", "*.yourdomain.com"]
        )

    # ── Global exception handler ──────────────────────────────────────────────

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error. Please try again later."},
        )

    # ── Routes ────────────────────────────────────────────────────────────────

    app.include_router(api_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")  # ✅ FIXED

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": f"Welcome to the {settings.APP_NAME}",
            "docs": "/api/docs"
        }

    return app


# ── App instance ──────────────────────────────────────────────────────────────

app = create_app()