
from typing import Optional

from core.db import Base
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Course(Base):
    __tablename__ = "courses"   # Use this name in ForeignKey của Chapter và Lesson để liên kết với Course

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    thumbnail: Mapped[Optional[str]] = mapped_column(String(1000))
    target_language: Mapped[str] = mapped_column(String(50))
    level: Mapped[str] = mapped_column(String(50))
    price: Mapped[float] = mapped_column()
    is_free: Mapped[bool] = mapped_column(default=True)
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, published, archived
    published_at: Mapped[Optional[str]] = mapped_column(String(50), default=None)
    created_at: Mapped[str] = mapped_column(String(50))
    updated_at: Mapped[str] = mapped_column(String(50))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id")) # Khóa ngoại liên kết với bảng users(chú ý tên bảng là __tablename__ của User)
    teacher: Mapped["User"] = relationship(back_populates="courses")  # Nhiều course thuộc về 1 teacher  
    chapters: Mapped[list["Chapter"]] = relationship(back_populates="course", cascade="all, delete-orphan")  # One-to-many với Chapter, course_id là FK



class Chapter(Base):
    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[Optional[str]] = mapped_column(String(2000))
    order: Mapped[int] = mapped_column()
    created_at: Mapped[str] = mapped_column(String(50))
    updated_at: Mapped[str] = mapped_column(String(50))
    course: Mapped["Course"] = relationship(back_populates="chapters")  # Nhiều chapter thuộc về 1 course
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="chapter", cascade="all, delete-orphan")  # One-to-many với Lesson, chapter_id là FK

class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    chapter_id: Mapped[int] = mapped_column(ForeignKey("chapters.id"))
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[Optional[str]] = mapped_column(String(2000))
    order: Mapped[int] = mapped_column()
    created_at: Mapped[str] = mapped_column(String(50))
    updated_at: Mapped[str] = mapped_column(String(50))
    chapter: Mapped["Chapter"] = relationship(back_populates="lessons")  # Nhiều lesson thuộc về 1 chapter