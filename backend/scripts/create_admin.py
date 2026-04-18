import asyncio
from app.core.database import AsyncSessionLocal
from app.services.user_service import UserService
from app.core.security import hash_password

async def create_admin():
    async with AsyncSessionLocal() as db:
        service = UserService(db)

        email = "admin@example.com"
        password = "admin123"

        # 🔐 hash password
        hashed = hash_password(password)

        # 👤 create user
        user = await service.create_user(email, hashed)

        print("✅ Admin created:", user.email)

asyncio.run(create_admin())