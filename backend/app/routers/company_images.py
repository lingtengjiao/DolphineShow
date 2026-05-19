from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.company_image import CompanyImage
from app.models.user import User
from app.schemas.company_image import CompanyImageCreate, CompanyImageOut, CompanyImageUpdate
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/company-images", tags=["company-images"])


@router.get("", response_model=list[CompanyImageOut])
async def list_company_images(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CompanyImage)
        .where(CompanyImage.is_active.is_(True))
        .order_by(CompanyImage.sort_order.asc(), CompanyImage.created_at.asc())
    )
    return result.scalars().all()


@router.get("/admin/all", response_model=list[CompanyImageOut])
async def admin_list_company_images(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CompanyImage).order_by(CompanyImage.sort_order.asc(), CompanyImage.created_at.asc())
    )
    return result.scalars().all()


@router.post("/admin", response_model=CompanyImageOut, status_code=status.HTTP_201_CREATED)
async def create_company_image(
    data: CompanyImageCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    img = CompanyImage(**data.model_dump())
    db.add(img)
    await db.flush()
    await db.refresh(img)
    return img


@router.put("/admin/{image_id}", response_model=CompanyImageOut)
async def update_company_image(
    image_id: int,
    data: CompanyImageUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CompanyImage).where(CompanyImage.id == image_id))
    img = result.scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(img, key, value)
    await db.flush()
    await db.refresh(img)
    return img


@router.delete("/admin/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company_image(
    image_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CompanyImage).where(CompanyImage.id == image_id))
    img = result.scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    await db.delete(img)
