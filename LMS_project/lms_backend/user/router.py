
from core.db import get_db
from fastapi import APIRouter
from fastapi import Depends as Depend
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas import UserCreate, UserRead
from .services import create_user, get_user_by_email_service

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


@router.get("/get/{email}", response_model=UserRead)
async def get_user_by_email(
    email: str,
    db: AsyncSession=Depend(get_db),
    ):
    return await get_user_by_email_service(db, email)