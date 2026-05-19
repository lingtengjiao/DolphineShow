from datetime import datetime
from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    reviewer_name: str
    reviewer_company: str | None = None
    reviewer_country: str | None = None
    content: str
    rating: int = Field(default=5, ge=1, le=5)
    avatar_url: str | None = None
    sort_order: int = 0
    is_active: bool = True


class ReviewUpdate(BaseModel):
    reviewer_name: str | None = None
    reviewer_company: str | None = None
    reviewer_country: str | None = None
    content: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    avatar_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ReviewOut(BaseModel):
    id: int
    reviewer_name: str
    reviewer_company: str | None
    reviewer_country: str | None
    content: str
    rating: int
    avatar_url: str | None
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
