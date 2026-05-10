from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.inquiry import InquiryStatus


class InquiryCreate(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    phone: str | None = None
    message: str
    product_ids: list[int] = []


class InquiryReply(BaseModel):
    admin_reply: str
    status: InquiryStatus = InquiryStatus.REPLIED


class InquiryOut(BaseModel):
    id: int
    user_id: int | None
    company_name: str
    contact_person: str
    email: str
    phone: str | None
    message: str
    product_ids: list[int]
    status: InquiryStatus
    admin_reply: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
