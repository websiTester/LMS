
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from user.models import User
from user.schemas import UserCreate


async def create_user(db: AsyncSession, createUserRequest: UserCreate) -> User:

    # Check if user already exists
    existing_user = await db.execute(select(User).where(User.email == createUserRequest.email))
    if existing_user.scalar() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={
            "code": "USER_ALREADY_EXISTS",
            "message": f"User with email {createUserRequest.email} already exists",
            "field": "email"
        })
    
    # Create new user
    new_user = User(username=createUserRequest.email, email=createUserRequest.email, hashed_password=createUserRequest.password, role=createUserRequest.role)  # You should hash the password in a real application
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user



async def get_user_by_email_service(db: AsyncSession, email: str) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={
            "code": "USER_NOT_FOUND",
            "message": f"User with email {email} not found",
            "field": "email"
        })
    return user