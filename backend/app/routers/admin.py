from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.inquiry import Inquiry
from app.models.product import Product
from app.models.product_line import ProductLine
from app.models.user import User, UserRole
from app.schemas.user import UserOut
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
async def dashboard(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    product_lines = (await db.execute(select(func.count()).select_from(ProductLine))).scalar() or 0
    products = (await db.execute(select(func.count()).select_from(Product))).scalar() or 0
    inquiries_total = (await db.execute(select(func.count()).select_from(Inquiry))).scalar() or 0
    inquiries_pending = (
        await db.execute(select(func.count()).select_from(Inquiry).where(Inquiry.status == "pending"))
    ).scalar() or 0
    b2b_clients = (
        await db.execute(select(func.count()).select_from(User).where(User.role == UserRole.B2B_CLIENT))
    ).scalar() or 0
    return {
        "product_lines": product_lines,
        "products": products,
        "inquiries_total": inquiries_total,
        "inquiries_pending": inquiries_pending,
        "b2b_clients": b2b_clients,
    }


@router.get("/users", response_model=list[UserOut])
async def list_users(
    role: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).order_by(User.created_at.desc())
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    return [UserOut.model_validate(u) for u in result.scalars().all()]


@router.put("/users/{user_id}/toggle-active", response_model=UserOut)
async def toggle_user_active(user_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot disable yourself")
    user.is_active = not user.is_active
    await db.flush()
    await db.refresh(user)
    return UserOut.model_validate(user)
