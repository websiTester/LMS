
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, model_validator


class UserCreate(BaseModel):
    email: EmailStr = Field(min_length=5, max_length=100)
    password: str = Field(min_length=6)
    confirm_password: str = Field(min_length=6)
    role: Literal["student", "teacher", "admin"]

    @model_validator(mode="after")
    def passwords_match(self):
        if(self.password != self.confirm_password):
            raise ValueError("Passwords do not match")
        return self


class UserRead(BaseModel):
    id: int
    email: EmailStr = Field(min_length=5, max_length=100)
    hashed_password: str
    full_name: Optional[str] = Field(default="Not provided")
    role: Literal["student", "teacher", "admin"]
    is_active: bool