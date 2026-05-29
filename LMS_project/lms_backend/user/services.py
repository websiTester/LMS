
from datetime import datetime, timezone

from core.security import hash_password, verify_password
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from user.models import User
from user.schemas import UserCreate


async def register_user_service(db: AsyncSession, createUserRequest: UserCreate) -> User:

    # Check if user already exists
    existing_user = await db.execute(select(User).where(User.email == createUserRequest.email))
    if existing_user.scalar() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={
            "code": "USER_ALREADY_EXISTS",
            "message": f"User with email {createUserRequest.email} already exists",
            "field": "email"
        })
    
    # Create new user
    new_user = User(username=createUserRequest.email, email=createUserRequest.email, hashed_password=hash_password(createUserRequest.password), role='student', created_at=datetime.now(timezone.utc) )  # You should hash the password in a real application
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


async def login_user_service(db: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email_service(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={
            "code": "INVALID_CREDENTIALS",
            "message": "Invalid email or password",
            "field": "email"
        })
    return user


async def get_all_users_service(db: AsyncSession) -> list[User]:
    result = await db.execute(select(User))
    users = result.scalars().all()
    return list(users)


async def upsert_user(db: AsyncSession, user: UserCreate) -> User:
    existing_user = await db.execute(select(User).where(User.email == user.email))
    existing_user = existing_user.scalar_one_or_none()

    if existing_user is None:
        new_user = User(
            username=user.email, 
            email=user.email, 
            hashed_password=hash_password(user.password), 
            role=user.role, 
            created_at=datetime.now(timezone.utc),
            is_active=user.is_active if user.is_active is not None else True)
              # You should hash the password in a real application
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    else:
        existing_user.hashed_password = hash_password(user.password)
        existing_user.role = user.role
        if user.is_active is not None:
            existing_user.is_active = user.is_active
        await db.commit()
        await db.refresh(existing_user)
        return existing_user