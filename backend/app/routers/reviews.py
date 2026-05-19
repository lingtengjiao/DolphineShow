from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.review import CustomerReview
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut, ReviewUpdate
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("", response_model=list[ReviewOut])
async def list_reviews(
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CustomerReview)
        .where(CustomerReview.is_active.is_(True))
        .order_by(CustomerReview.sort_order.asc(), CustomerReview.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/admin/all", response_model=list[ReviewOut])
async def admin_list_reviews(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CustomerReview).order_by(CustomerReview.sort_order.asc(), CustomerReview.created_at.desc())
    )
    return result.scalars().all()


@router.post("/admin", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    data: ReviewCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    review = CustomerReview(**data.model_dump())
    db.add(review)
    await db.flush()
    await db.refresh(review)
    return review


@router.put("/admin/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: int,
    data: ReviewUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CustomerReview).where(CustomerReview.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(review, key, value)
    await db.flush()
    await db.refresh(review)
    return review


@router.delete("/admin/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CustomerReview).where(CustomerReview.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    await db.delete(review)
