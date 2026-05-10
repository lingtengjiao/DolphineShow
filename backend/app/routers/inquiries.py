from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.inquiry import Inquiry
from app.models.user import User
from app.schemas.inquiry import InquiryCreate, InquiryOut, InquiryReply
from app.utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])


@router.post("", response_model=InquiryOut, status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    data: InquiryCreate,
    user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    inquiry = Inquiry(
        **data.model_dump(),
        user_id=user.id if user else None,
    )
    db.add(inquiry)
    await db.flush()
    await db.refresh(inquiry)
    return InquiryOut.model_validate(inquiry)


# --- Admin endpoints ---

@router.get("/admin/all", response_model=list[InquiryOut])
async def admin_list_inquiries(
    status_filter: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Inquiry).order_by(Inquiry.created_at.desc())
    if status_filter:
        query = query.where(Inquiry.status == status_filter)
    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    return [InquiryOut.model_validate(i) for i in result.scalars().all()]


@router.get("/admin/stats")
async def admin_inquiry_stats(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    total = (await db.execute(select(func.count()).select_from(Inquiry))).scalar() or 0
    pending = (await db.execute(select(func.count()).select_from(Inquiry).where(Inquiry.status == "pending"))).scalar() or 0
    return {"total": total, "pending": pending, "replied": total - pending}


@router.put("/admin/{inquiry_id}", response_model=InquiryOut)
async def reply_inquiry(
    inquiry_id: int, data: InquiryReply, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Inquiry).where(Inquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    inquiry.admin_reply = data.admin_reply
    inquiry.status = data.status
    await db.flush()
    await db.refresh(inquiry)
    return InquiryOut.model_validate(inquiry)
