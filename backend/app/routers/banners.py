from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.banner import Banner
from app.schemas.banner import BannerCreate, BannerOut, BannerUpdate
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/banners", tags=["banners"])


@router.get("", response_model=list[BannerOut])
async def list_banners(db: AsyncSession = Depends(get_db)):
    """公开接口：返回所有启用的 Banner，按 sort_order 排序"""
    result = await db.execute(
        select(Banner)
        .where(Banner.is_active.is_(True))
        .order_by(Banner.sort_order, Banner.id)
    )
    return result.scalars().all()


@router.get("/admin/all", response_model=list[BannerOut])
async def admin_list_banners(
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Banner).order_by(Banner.sort_order, Banner.id))
    return result.scalars().all()


@router.post("/admin", response_model=BannerOut, status_code=status.HTTP_201_CREATED)
async def create_banner(
    data: BannerCreate,
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    banner = Banner(**data.model_dump())
    db.add(banner)
    await db.commit()
    await db.refresh(banner)
    return banner


@router.put("/admin/{banner_id}", response_model=BannerOut)
async def update_banner(
    banner_id: int,
    data: BannerUpdate,
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    banner = result.scalar_one_or_none()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(banner, field, value)

    await db.commit()
    await db.refresh(banner)
    return banner


@router.delete("/admin/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_banner(
    banner_id: int,
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    banner = result.scalar_one_or_none()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    await db.delete(banner)
    await db.commit()
