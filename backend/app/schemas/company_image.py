from datetime import datetime
from pydantic import BaseModel

VALID_CATEGORIES = ("factory", "team", "brand", "certificate", "other")


class CompanyImageCreate(BaseModel):
    url: str
    category: str = "factory"
    caption: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CompanyImageUpdate(BaseModel):
    url: str | None = None
    category: str | None = None
    caption: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CompanyImageOut(BaseModel):
    id: int
    url: str
    category: str
    caption: str | None
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
