
from auth.dependencies import require_role
from core.config import settings
from core.db import get_db
from core.dependencies import get_current_user
from core.security import create_access_token
from fastapi import APIRouter, Response
from fastapi import Depends as Depend
from sqlalchemy.ext.asyncio import AsyncSession
from user.models import User

from .schemas import UserCreate, UserLogin, UserRead
from .services import create_user, get_all_users_service, login_user_service

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post("/register", response_model=UserRead)
async def register_user(
    payload: UserCreate,
    db: AsyncSession=Depend(get_db),
    ):
    # This is a placeholder for the actual implementation
    result = await create_user(db, payload)
    return result


@router.post("/login", response_model=UserRead)
async def login_user(
    payload: UserLogin, response: Response,
    db: AsyncSession=Depend(get_db),
    ):
    user = await login_user_service(db, payload.email, payload.password)

    access_token = create_access_token({"sub": str(user.id)})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,  # Chỉ gửi cookie qua HTTPS
        samesite="strict",  # Ngăn chặn CSRF
        max_age=1800  # 30 phút
    )
    # user = await login_user_service(db, payload.email, payload.password)
    return user


@router.post("/logout")
async def logout_user(response: Response):
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=settings.is_production,
        samesite="strict",
        max_age=0  # Xóa cookie ngay lập tức
    )
    return {"message": "Logged out successfully"}



@router.get("/me", response_model=UserRead)
async def get_me(
    current_user=Depend(get_current_user)
    ):
    return current_user


@router.get("/all", response_model=list[UserRead])
async def get_all_users(
    db: AsyncSession=Depend(get_db),
    admin: User=Depend(require_role("admin"))
    ):

    user_list = await get_all_users_service(db)
    return user_list