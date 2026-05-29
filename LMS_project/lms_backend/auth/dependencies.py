from core.dependencies import get_current_user
from fastapi import Depends, HTTPException, status


def require_role(*allowed_roles: str):
    async def checker(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return checker