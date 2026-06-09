
from auth.dependencies import require_role
from core.db import get_db
from course.schemas import CourseCreate, CourseRead
from course.services import (
    create_course_service,
    get_course_by_id_service,
    get_courses_by_teacherid_service,
    update_course_service,
)
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(
    prefix="/teacher",
    tags=["Teacher - Course Management"],
    )

@router.get("/list-courses", response_model=list[CourseRead])
async def list_courses(teacher=Depends(require_role("teacher")), db=Depends(get_db)):
    result = await get_courses_by_teacherid_service(db, teacher.id)

    return result


@router.post("/create-course", response_model=CourseRead)
async def create_course(course_data: CourseCreate, teacher=Depends(require_role("teacher")), db=Depends(get_db)):
    result = await create_course_service(db, course_data, teacher.id)
    return result


@router.get("/courses/{course_id}", response_model=CourseRead)
async def get_course_by_id(course_id: int, teacher=Depends(require_role("teacher")), db=Depends(get_db)):
    course = await get_course_by_id_service(db, course_id)
    if course.teacher_id != teacher.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={
            "code": "FORBIDDEN",
            "message": "You do not have permission to access this course",
            "field": "course_id"
        })
    return course


@router.put("/courses/update/{course_id}", response_model=CourseRead)
async def update_course(course_id: int, course_data: CourseCreate, teacher=Depends(require_role("teacher")), db=Depends(get_db)):
    course = await get_course_by_id_service(db, course_id)
    if course.teacher_id != teacher.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={
            "code": "FORBIDDEN",
            "message": "You do not have permission to update this course",
            "field": "course_id"
        })
    updated_course = await update_course_service(db, course_id, course_data)

    return updated_course  # Placeholder return until the update service is implemented