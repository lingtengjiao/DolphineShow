from datetime import datetime

from pydantic import BaseModel


class BannerBase(BaseModel):
    tag: str | None = None
    title: str
    subtitle: str | None = None
    cta_text: str | None = None
    cta_link: str | None = None
    image_url: str | None = None
    bg_gradient: str | None = None
    sort_order: int = 0
    is_active: bool = True


class BannerCreate(BannerBase):
    pass


class BannerUpdate(BaseModel):
    tag: str | None = None
    title: str | None = None
    subtitle: str | None = None
    cta_text: str | None = None
    cta_link: str | None = None
    image_url: str | None = None
    bg_gradient: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class BannerOut(BannerBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
