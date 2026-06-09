
from core.db import get_db
from course.schemas import CourseRead
from course.services import (
    get_all_courses_service,
    get_course_by_id_service,
    get_course_by_slug_service,
)
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
)

# @router.post("/allCourses", response_model=None)
# async def get_all_courses(teacher=Depend(require_role("student", "teacher"))):
#     # This is a placeholder for the actual implementation
    
#     return {"message": "This endpoint will return all courses."}



@router.get("/allCourses", response_model=list[CourseRead])
async def get_all_courses(db: AsyncSession=Depends(get_db),):
    # This is a placeholder for the actual implementation
    courses = await get_all_courses_service(db)
    return courses



@router.post("/{slug}", response_model=CourseRead)
async def get_course_by_slug(
    slug: str = "null",
    db: AsyncSession=Depends(get_db)):
    # This is a placeholder for the actual implementation
    course = await get_course_by_slug_service(db, slug)
    return course


@router.get("/{course_id}", response_model=CourseRead)
async def get_course_by_id(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    course = await get_course_by_id_service(db, course_id)
    return course