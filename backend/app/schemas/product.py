from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class PriceTier(BaseModel):
    min_qty: int
    max_qty: int | None = None
    price: Decimal


class ProductCreate(BaseModel):
    product_line_id: int
    name: str
    sku: str
    description: str | None = None
    detail_html: str | None = None
    main_image: str | None = None
    video_url: str | None = None
    images: list[str] = []
    price: Decimal | None = None
    price_tiers: list[PriceTier] = []
    min_order_qty: int = 1
    material: str | None = None
    size: str | None = None
    weight: str | None = None
    certifications: list[str] = []
    intl_url: str | None = None
    is_featured: bool = False
    is_new: bool = False
    is_active: bool = True


class ProductUpdate(BaseModel):
    product_line_id: int | None = None
    name: str | None = None
    sku: str | None = None
    description: str | None = None
    detail_html: str | None = None
    main_image: str | None = None
    video_url: str | None = None
    images: list[str] | None = None
    price: Decimal | None = None
    price_tiers: list[PriceTier] | None = None
    min_order_qty: int | None = None
    material: str | None = None
    size: str | None = None
    weight: str | None = None
    certifications: list[str] | None = None
    intl_url: str | None = None
    is_featured: bool | None = None
    is_new: bool | None = None
    is_active: bool | None = None


class ProductOut(BaseModel):
    id: int
    product_line_id: int
    product_line_name: str = ""
    name: str
    sku: str
    description: str | None
    detail_html: str | None
    main_image: str | None
    video_url: str | None = None
    images: list[str]
    price: Decimal | None = None
    price_tiers: list[PriceTier] = []
    min_order_qty: int
    material: str | None
    size: str | None
    weight: str | None
    certifications: list[str] = []
    intl_url: str | None = None
    is_featured: bool
    is_new: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    id: int
    product_line_id: int
    product_line_name: str = ""
    name: str
    sku: str
    description: str | None
    main_image: str | None
    price: Decimal | None = None
    is_featured: bool
    is_new: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedProducts(BaseModel):
    items: list[ProductListOut]
    total: int
    page: int
    page_size: int
    total_pages: int
