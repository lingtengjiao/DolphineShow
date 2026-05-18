import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.product import Product
from app.models.product_line import ProductLine
from app.models.user import User
from app.schemas.product import (
    PaginatedProducts,
    ProductCreate,
    ProductListOut,
    ProductOut,
    ProductUpdate,
)
from app.utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/products", tags=["products"])


def _product_to_list_out(p: Product, hide_price: bool = False) -> ProductListOut:
    out = ProductListOut.model_validate(p)
    out.product_line_name = p.product_line.name if p.product_line else ""
    if hide_price:
        out.price = None
    return out


def _product_to_out(p: Product, hide_price: bool = False) -> ProductOut:
    out = ProductOut.model_validate(p)
    out.product_line_name = p.product_line.name if p.product_line else ""
    if hide_price:
        out.price = None
    return out


@router.get("", response_model=PaginatedProducts)
async def list_products(
    product_line_id: int | None = None,
    product_line_slug: str | None = None,
    is_featured: bool | None = None,
    is_new: bool | None = None,
    search: str | None = None,
    sort_by: str = Query("newest", pattern="^(newest|oldest|name_asc|name_desc|price_asc|price_desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(16, ge=1, le=64),
    user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).options(selectinload(Product.product_line)).where(Product.is_active.is_(True))

    if product_line_id:
        # Include products from sub-lines as well
        child_ids_result = await db.execute(
            select(ProductLine.id).where(ProductLine.parent_id == product_line_id)
        )
        child_ids = [r for (r,) in child_ids_result.all()]
        all_ids = [product_line_id] + child_ids
        query = query.where(Product.product_line_id.in_(all_ids))
    if product_line_slug:
        # Resolve slug → id, then include sub-lines
        pl_result = await db.execute(
            select(ProductLine.id, ProductLine.parent_id).where(ProductLine.slug == product_line_slug)
        )
        pl_row = pl_result.one_or_none()
        if pl_row:
            pl_id_val = pl_row[0]
            child_ids_result = await db.execute(
                select(ProductLine.id).where(ProductLine.parent_id == pl_id_val)
            )
            child_ids = [r for (r,) in child_ids_result.all()]
            all_ids = [pl_id_val] + child_ids
            query = query.where(Product.product_line_id.in_(all_ids))
    if is_featured is not None:
        query = query.where(Product.is_featured == is_featured)
    if is_new is not None:
        query = query.where(Product.is_new == is_new)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))

    sort_map = {
        "newest": Product.created_at.desc(),
        "oldest": Product.created_at.asc(),
        "name_asc": Product.name.asc(),
        "name_desc": Product.name.desc(),
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
    }
    query = query.order_by(sort_map.get(sort_by, Product.created_at.desc()))

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()

    hide_price = user is None
    return PaginatedProducts(
        items=[_product_to_list_out(p, hide_price) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/featured", response_model=list[ProductListOut])
async def featured_products(
    limit: int = Query(10, ge=1, le=20),
    user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.product_line))
        .where(Product.is_active.is_(True), Product.is_featured.is_(True))
        .order_by(Product.created_at.desc())
        .limit(limit)
    )
    hide_price = user is None
    return [_product_to_list_out(p, hide_price) for p in result.scalars().all()]


@router.get("/new", response_model=list[ProductListOut])
async def new_products(
    limit: int = Query(10, ge=1, le=20),
    user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.product_line))
        .where(Product.is_active.is_(True), Product.is_new.is_(True))
        .order_by(Product.created_at.desc())
        .limit(limit)
    )
    hide_price = user is None
    return [_product_to_list_out(p, hide_price) for p in result.scalars().all()]


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(
    product_id: int,
    user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).options(selectinload(Product.product_line)).where(Product.id == product_id, Product.is_active.is_(True))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _product_to_out(product, hide_price=user is None)


@router.get("/{product_id}/related", response_model=list[ProductListOut])
async def related_products(
    product_id: int,
    limit: int = Query(6, ge=1, le=12),
    user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.product_line))
        .where(Product.product_line_id == product.product_line_id, Product.id != product_id, Product.is_active.is_(True))
        .order_by(func.random())
        .limit(limit)
    )
    hide_price = user is None
    return [_product_to_list_out(p, hide_price) for p in result.scalars().all()]


# --- Admin endpoints ---

@router.get("/admin/all", response_model=PaginatedProducts)
async def admin_list_products(
    product_line_id: int | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).options(selectinload(Product.product_line))
    if product_line_id:
        query = query.where(Product.product_line_id == product_line_id)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))
    query = query.order_by(Product.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    products = result.scalars().all()
    return PaginatedProducts(
        items=[_product_to_list_out(p, hide_price=False) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/admin/{product_id}", response_model=ProductOut)
async def admin_get_product(
    product_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).options(selectinload(Product.product_line)).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _product_to_out(product)


@router.post("/admin", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(Product).where(Product.sku == data.sku))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
    product = Product(**data.model_dump())
    db.add(product)
    await db.flush()
    result = await db.execute(
        select(Product).options(selectinload(Product.product_line)).where(Product.id == product.id)
    )
    product = result.scalar_one()
    return _product_to_out(product)


@router.put("/admin/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int, data: ProductUpdate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).options(selectinload(Product.product_line)).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    await db.flush()
    await db.refresh(product)
    return _product_to_out(product)


@router.delete("/admin/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await db.delete(product)
