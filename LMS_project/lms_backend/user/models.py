
from optparse import Option
from typing import Optional

from core.db import Base
from sqlalchemy import String
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
    created_at: Mapped[Optional[str]] = mapped_column(String(50))
    updated_at: Mapped[Optional[str]] = mapped_column(String(50))
    profile_picture: Mapped[Optional[str]] = mapped_column(String(1000), default=None)
    courses: Mapped[list["Course"]] = relationship(back_populates="teacher")  # One-to-many với Course, teacher_id là FK


