
from datetime import datetime

from course.models import Course
from course.utils import get_slug
from fastapi import HTTPException, status
from sqlalchemy import select


async def get_all_courses_service(db):
    result = await db.execute(select(Course))
    courses = result.scalars().all()
    
    return courses


async def get_course_by_slug_service(db, slug: str) -> Course:
    result = await db.execute(select(Course).where(Course.slug == slug))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={
            "code": "COURSE_NOT_FOUND",
            "message": "Course not found",
            "field": "slug"
        })
    return course


async def get_courses_by_teacherid_service(db, teacher_id: int):
    result = await db.execute(select(Course).where(Course.teacher_id == teacher_id))
    courses = result.scalars().all()
    
    return courses

async def create_course_service(db, course_data, teacher_id: int):
    new_course = Course(
        title=course_data.title,
        slug=get_slug(course_data.title),
        description=course_data.description,
        thumbnail=course_data.thumbnail,
        target_language=course_data.target_language,
        level=course_data.level,
        price=course_data.price,
        is_free=course_data.is_free,
        teacher_id=teacher_id,
        status="draft",
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat(),
    )
    db.add(new_course)
    await db.commit()
    await db.refresh(new_course)
    return new_course


async def get_course_by_id_service(db, course_id: int) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={
            "code": "COURSE_NOT_FOUND",
            "message": "Course not found",
            "field": "id"
        })
    return course


async def update_course_service(db, course_id: int, course_data):
    course = await get_course_by_id_service(db, course_id)
    course.title = course_data.title
    course.slug = get_slug(course_data.title)
    course.description = course_data.description
    course.thumbnail = course_data.thumbnail
    course.target_language = course_data.target_language
    course.level = course_data.level
    course.price = course_data.price
    course.is_free = course_data.is_free
    course.updated_at = datetime.now().isoformat()
    
    db.add(course)
    await db.commit()
    await db.refresh(course)
    
    return course