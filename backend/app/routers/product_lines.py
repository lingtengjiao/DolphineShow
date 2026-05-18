from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.product import Product
from app.models.product_line import ProductLine
from app.models.user import User
from app.schemas.product_line import (
    ProductLineCreate,
    ProductLineOut,
    ProductLineTree,
    ProductLineUpdate,
)
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/product-lines", tags=["product_lines"])


async def _product_count(db: AsyncSession, pl_id: int) -> int:
    result = await db.execute(
        select(func.count()).where(Product.product_line_id == pl_id, Product.is_active.is_(True))
    )
    return result.scalar() or 0


async def _enrich(db: AsyncSession, pl: ProductLine) -> ProductLineOut:
    out = ProductLineOut.model_validate(pl)
    out.product_count = await _product_count(db, pl.id)
    return out


async def _enrich_tree(db: AsyncSession, pl: ProductLine) -> ProductLineTree:
    """Recursively build a tree node with enriched product_count."""
    out = ProductLineTree(
        id=pl.id,
        parent_id=pl.parent_id,
        name=pl.name,
        slug=pl.slug,
        description=pl.description,
        cover_image=pl.cover_image,
        sort_order=pl.sort_order,
        is_active=pl.is_active,
        product_count=await _product_count(db, pl.id),
        created_at=pl.created_at,
        children=[],
    )
    if pl.children:
        out.children = [await _enrich_tree(db, child) for child in pl.children if child.is_active]
    return out


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

@router.get("/tree", response_model=list[ProductLineTree])
async def get_product_line_tree(db: AsyncSession = Depends(get_db)):
    """Return only top-level lines (parent_id IS NULL) with children nested."""
    result = await db.execute(
        select(ProductLine)
        .options(selectinload(ProductLine.children).selectinload(ProductLine.children))
        .where(ProductLine.is_active.is_(True), ProductLine.parent_id.is_(None))
        .order_by(ProductLine.sort_order, ProductLine.name)
    )
    top_lines = result.scalars().all()
    return [await _enrich_tree(db, pl) for pl in top_lines]


@router.get("", response_model=list[ProductLineOut])
async def list_product_lines(db: AsyncSession = Depends(get_db)):
    """Flat list of all active product lines (used for dropdowns etc.)."""
    result = await db.execute(
        select(ProductLine)
        .where(ProductLine.is_active.is_(True))
        .order_by(ProductLine.sort_order, ProductLine.name)
    )
    lines = result.scalars().all()
    return [await _enrich(db, pl) for pl in lines]


@router.get("/{slug}", response_model=ProductLineTree)
async def get_product_line(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ProductLine)
        .options(selectinload(ProductLine.children).selectinload(ProductLine.children))
        .where(ProductLine.slug == slug, ProductLine.is_active.is_(True))
    )
    pl = result.scalar_one_or_none()
    if not pl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product line not found")
    return await _enrich_tree(db, pl)


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@router.get("/admin/all", response_model=list[ProductLineOut])
async def admin_list_product_lines(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ProductLine).order_by(ProductLine.sort_order, ProductLine.name)
    )
    lines = result.scalars().all()
    return [await _enrich(db, pl) for pl in lines]


@router.post("/admin", response_model=ProductLineOut, status_code=status.HTTP_201_CREATED)
async def create_product_line(
    data: ProductLineCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if data.parent_id is not None:
        parent = await db.get(ProductLine, data.parent_id)
        if not parent:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="父级产品线不存在")
        if parent.parent_id is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="不支持超过两级的分类")

    slug = slugify(data.name)
    existing = await db.execute(select(ProductLine).where(ProductLine.slug == slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="同名产品线已存在")

    pl = ProductLine(slug=slug, **data.model_dump())
    db.add(pl)
    await db.flush()
    await db.refresh(pl)
    return await _enrich(db, pl)


@router.put("/admin/{pl_id}", response_model=ProductLineOut)
async def update_product_line(
    pl_id: int,
    data: ProductLineUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ProductLine).where(ProductLine.id == pl_id))
    pl = result.scalar_one_or_none()
    if not pl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product line not found")

    update_data = data.model_dump(exclude_unset=True)

    if "parent_id" in update_data and update_data["parent_id"] is not None:
        new_parent_id = update_data["parent_id"]
        if new_parent_id == pl_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="不能将自身设为父级")
        parent = await db.get(ProductLine, new_parent_id)
        if not parent:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="父级产品线不存在")
        if parent.parent_id is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="不支持超过两级的分类")

    if "name" in update_data:
        update_data["slug"] = slugify(update_data["name"])

    for key, value in update_data.items():
        setattr(pl, key, value)

    await db.flush()
    await db.refresh(pl)
    return await _enrich(db, pl)


@router.delete("/admin/{pl_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_line(
    pl_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProductLine)
        .options(selectinload(ProductLine.children))
        .where(ProductLine.id == pl_id)
    )
    pl = result.scalar_one_or_none()
    if not pl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product line not found")

    if pl.children:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"该产品线下有 {len(pl.children)} 个子系列，请先删除或转移子系列",
        )

    product_count = (
        await db.execute(select(func.count()).where(Product.product_line_id == pl_id))
    ).scalar() or 0
    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"该产品线下有 {product_count} 个产品，请先删除或转移这些产品",
        )
    await db.delete(pl)
