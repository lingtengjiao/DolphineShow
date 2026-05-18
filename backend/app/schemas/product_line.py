from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class ProductLineCreate(BaseModel):
    name: str
    parent_id: int | None = None
    description: str | None = None
    cover_image: str | None = None
    sort_order: int = 0
    is_active: bool = True


class ProductLineUpdate(BaseModel):
    name: str | None = None
    parent_id: int | None = None
    description: str | None = None
    cover_image: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ProductLineOut(BaseModel):
    id: int
    parent_id: int | None
    name: str
    slug: str
    description: str | None
    cover_image: str | None
    sort_order: int
    is_active: bool
    product_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductLineTree(ProductLineOut):
    """Parent product line with nested children."""
    children: list[ProductLineTree] = []

    model_config = {"from_attributes": True}


ProductLineTree.model_rebuild()
