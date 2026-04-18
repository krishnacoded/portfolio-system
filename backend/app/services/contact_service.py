from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.contact import ContactSubmission
from app.schemas.contact import ContactCreate


class ContactService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_submission(
        self,
        data: ContactCreate,
        ip_address: str | None = None,
    ) -> ContactSubmission:
        submission = ContactSubmission(
            name=data.name,
            email=data.email,
            phone=data.phone,
            message=data.message,
            ip_address=ip_address,
        )

        self.db.add(submission)

        # ✅ Save to DB
        await self.db.commit()

        # Refresh to get updated values
        await self.db.refresh(submission)

        return submission

    async def get_all_submissions(
        self, skip: int = 0, limit: int = 50
    ) -> list[ContactSubmission]:
        result = await self.db.execute(
            select(ContactSubmission)
            .order_by(ContactSubmission.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_submission_count(self) -> int:
        result = await self.db.execute(
            select(func.count(ContactSubmission.id))
        )
        return result.scalar_one()