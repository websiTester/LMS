

from typing import Optional

from pydantic import BaseModel


class CourseRead(BaseModel):
    id: int
    slug: str
    title: str
    description: Optional[str]
    thumbnail: Optional[str]
    target_language: str
    level: str
    price: float
    is_free: bool
    status: str
    teacher_id: int
    created_at: Optional[str]
    updated_at: Optional[str]

    
class CourseCreate(BaseModel):
    title: str
    description: Optional[str]
    thumbnail: Optional[str]
    target_language: str
    level: str
    price: float
    is_free: bool