from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_line_id: Mapped[int] = mapped_column(ForeignKey("product_lines.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    detail_html: Mapped[str | None] = mapped_column(Text)
    main_image: Mapped[str | None] = mapped_column(String(500))
    video_url: Mapped[str | None] = mapped_column(String(500))
    images: Mapped[list | None] = mapped_column(JSONB, default=list)
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    min_order_qty: Mapped[int] = mapped_column(Integer, default=1)
    material: Mapped[str | None] = mapped_column(String(255))
    size: Mapped[str | None] = mapped_column(String(255))
    weight: Mapped[str | None] = mapped_column(String(100))
    intl_url: Mapped[str | None] = mapped_column(String(500))
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product_line = relationship("ProductLine", back_populates="products")
