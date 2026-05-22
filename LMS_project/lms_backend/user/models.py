
from typing import Optional

from core.db import Base
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), default=None)
    hashed_password: Mapped[str] = mapped_column()
    role: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(default=True)


