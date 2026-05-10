import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from PIL import Image

from app.config import settings
from app.models.user import User
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/image")
async def upload_image(file: UploadFile, admin: User = Depends(require_admin)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, WebP, GIF allowed")
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (max 10MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    thumb_filename = f"thumb_{filename}"
    thumb_path = os.path.join(settings.UPLOAD_DIR, thumb_filename)
    try:
        img = Image.open(filepath)
        img.thumbnail((400, 400))
        img.save(thumb_path)
    except Exception:
        thumb_filename = filename

    return {
        "url": f"/uploads/{filename}",
        "thumbnail": f"/uploads/{thumb_filename}",
        "filename": filename,
    }
