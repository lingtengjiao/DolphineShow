from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    company_name: str
    contact_person: str
    phone: str | None = None


class UserOut(BaseModel):
    id: int
    email: str
    company_name: str | None
    contact_person: str | None
    phone: str | None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
