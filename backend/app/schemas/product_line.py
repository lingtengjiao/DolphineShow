from datetime import datetime

from pydantic import BaseModel


class ProductLineCreate(BaseModel):
    name: str
    description: str | None = None
    cover_image: str | None = None
    sort_order: int = 0
    is_active: bool = True


class ProductLineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    cover_image: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ProductLineOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    cover_image: str | None
    sort_order: int
    is_active: bool
    product_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
