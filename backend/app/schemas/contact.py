from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
import re


# ── Request ───────────────────────────────────────────────────────────────────

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name must not be empty")
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name must be at most 100 characters")
        return v

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message must not be empty")
        if len(v) < 10:
            raise ValueError("Message must be at least 10 characters")
        if len(v) > 2000:
            raise ValueError("Message must be at most 2000 characters")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str | None) -> str | None:
        if v is None or v.strip() == "":
            return None
        v = v.strip()
        if not re.match(r"^\+?[\d\s\-()\.]{7,15}$", v):
            raise ValueError("Enter a valid phone number")
        return v


# ── Response ──────────────────────────────────────────────────────────────────

class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: ContactResponse | None = None
