import io
import uuid

import tos
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from PIL import Image

from app.config import settings
from app.models.user import User
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB


def _tos_client():
    return tos.TosClientV2(
        ak=settings.TOS_ACCESS_KEY,
        sk=settings.TOS_SECRET_KEY,
        endpoint=settings.TOS_ENDPOINT,
        region=settings.TOS_REGION,
    )


def _upload_bytes(client, key: str, data: bytes, content_type: str) -> str:
    client.put_object(
        bucket=settings.TOS_BUCKET,
        key=key,
        content=io.BytesIO(data),
        content_type=content_type,
    )
    return f"https://{settings.TOS_BUCKET}.{settings.TOS_ENDPOINT}/{key}"


@router.post("/image")
async def upload_image(file: UploadFile, admin: User = Depends(require_admin)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, WebP, GIF allowed")
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (max 10MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    thumb_filename = f"thumb_{filename}"

    try:
        client = _tos_client()
        # 上传原图
        url = _upload_bytes(client, f"images/{filename}", content, file.content_type)
        # 生成缩略图并上传
        try:
            img = Image.open(io.BytesIO(content))
            img.thumbnail((400, 400))
            buf = io.BytesIO()
            img.save(buf, format=img.format or "JPEG")
            thumb_url = _upload_bytes(client, f"images/{thumb_filename}", buf.getvalue(), file.content_type)
        except Exception:
            thumb_url = url
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"TOS upload failed: {e}")

    return {
        "url": url,
        "thumbnail": thumb_url,
        "filename": filename,
    }
