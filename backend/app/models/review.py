from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CustomerReview(Base):
    __tablename__ = "customer_reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    reviewer_name: Mapped[str] = mapped_column(String(100))
    reviewer_company: Mapped[str | None] = mapped_column(String(200))
    reviewer_country: Mapped[str | None] = mapped_column(String(100))
    content: Mapped[str] = mapped_column(Text)
    rating: Mapped[int] = mapped_column(SmallInteger, default=5)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
