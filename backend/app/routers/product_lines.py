from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product
from app.models.product_line import ProductLine
from app.models.user import User
from app.schemas.product_line import ProductLineCreate, ProductLineOut, ProductLineUpdate
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/product-lines", tags=["product_lines"])


async def _enrich_product_count(db: AsyncSession, pl: ProductLine) -> ProductLineOut:
    count_result = await db.execute(
        select(func.count()).where(Product.product_line_id == pl.id, Product.is_active.is_(True))
    )
    out = ProductLineOut.model_validate(pl)
    out.product_count = count_result.scalar() or 0
    return out


@router.get("", response_model=list[ProductLineOut])
async def list_product_lines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ProductLine).where(ProductLine.is_active.is_(True)).order_by(ProductLine.sort_order, ProductLine.name)
    )
    lines = result.scalars().all()
    return [await _enrich_product_count(db, pl) for pl in lines]


@router.get("/{slug}", response_model=ProductLineOut)
async def get_product_line(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductLine).where(ProductLine.slug == slug, ProductLine.is_active.is_(True)))
    pl = result.scalar_one_or_none()
    if not pl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product line not found")
    return await _enrich_product_count(db, pl)


# --- Admin endpoints ---

@router.get("/admin/all", response_model=list[ProductLineOut])
async def admin_list_product_lines(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductLine).order_by(ProductLine.sort_order, ProductLine.name))
    lines = result.scalars().all()
    return [await _enrich_product_count(db, pl) for pl in lines]


@router.post("/admin", response_model=ProductLineOut, status_code=status.HTTP_201_CREATED)
async def create_product_line(
    data: ProductLineCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    slug = slugify(data.name)
    existing = await db.execute(select(ProductLine).where(ProductLine.slug == slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product line with this name already exists")
    pl = ProductLine(slug=slug, **data.model_dump())
    db.add(pl)
    await db.flush()
    await db.refresh(pl)
    return await _enrich_product_count(db, pl)


@router.put("/admin/{pl_id}", response_model=ProductLineOut)
async def update_product_line(
    pl_id: int, data: ProductLineUpdate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ProductLine).where(ProductLine.id == pl_id))
    pl = result.scalar_one_or_none()
    if not pl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product line not found")
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["slug"] = slugify(update_data["name"])
    for key, value in update_data.items():
        setattr(pl, key, value)
    await db.flush()
    await db.refresh(pl)
    return await _enrich_product_count(db, pl)


@router.delete("/admin/{pl_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_line(pl_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductLine).where(ProductLine.id == pl_id))
    pl = result.scalar_one_or_none()
    if not pl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product line not found")
    product_count = (await db.execute(
        select(func.count()).where(Product.product_line_id == pl_id)
    )).scalar() or 0
    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"该产品线下有 {product_count} 个产品，请先删除或转移这些产品",
        )
    await db.delete(pl)
