from core.db import get_db
from core.security import decode_token
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from user.models import User


async def get_current_user(
        request: Request, 
        db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("access_token")
    print(f"[DEBUG 1] Token from cookie: {token[:20] if token else 'NONE'}...")

    if not token:
        print("[DEBUG] FAIL: No token in cookie")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated")
    try:
        payload = decode_token(token)
        print(f"[DEBUG 2] Decoded payload: {payload}")

        user_id = int(payload.get("sub"))
        print(f"[DEBUG 3] user_id = {user_id}, type = {type(user_id)}")
        if user_id is None:
            print("[DEBUG] FAIL: user_id is None")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing user ID")
        
    except JWTError as e:
        print(f"[DEBUG] FAIL: JWTError → {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await db.get(User, user_id)
    print(f"[DEBUG 4] User from DB: {user}")
    if user is None:
        print(f"[DEBUG] FAIL: No user with id={user_id}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


