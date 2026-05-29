from auth.dependencies import require_role
from core.db import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from user.models import User
from user.schemas import UserCreate
from user.services import upsert_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin - User Management"],
)


@router.post("/create-account")
async def create_account(
    payload: UserCreate,
    db: AsyncSession=Depends(get_db),
    admin: User=Depends(require_role("admin"))
):
    
    result = await upsert_user(db, payload)
    return result