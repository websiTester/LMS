from datetime import datetime
from typing import Optional

from core.db import Base
from sqlalchemy import String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), default=None)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), default=None)
    hashed_password: Mapped[str] = mapped_column()
    role: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    profile_picture: Mapped[Optional[str]] = mapped_column(String(1000), default=None)
    courses: Mapped[list["Course"]] = relationship(back_populates="teacher")  # One-to-many với Course, teacher_id là FK


