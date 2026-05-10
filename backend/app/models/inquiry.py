import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InquiryStatus(str, enum.Enum):
    PENDING = "pending"
    REPLIED = "replied"
    CLOSED = "closed"


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    company_name: Mapped[str] = mapped_column(String(255))
    contact_person: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    message: Mapped[str] = mapped_column(Text)
    product_ids: Mapped[list | None] = mapped_column(JSONB, default=list)
    status: Mapped[InquiryStatus] = mapped_column(Enum(InquiryStatus), default=InquiryStatus.PENDING)
    admin_reply: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="inquiries")
