
from course.models import Course
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