from fastapi import APIRouter
from app.api import contact, admin, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(contact.router)
api_router.include_router(admin.router)
