
from datetime import datetime
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, model_validator
from pydantic.functional_validators import AfterValidator
from pydantic_core import PydanticCustomError
from user.utils import validate_length


class UserBase(BaseModel):
    email: Annotated[EmailStr, AfterValidator(validate_length(10, 100, "Email"))]


class UserCreate(UserBase):
    password: Annotated[str, AfterValidator(validate_length(6, 100, "Password"))]
    confirm_password: Annotated[str, AfterValidator(validate_length(6, 100, "Confirm Password"))]

    role: Literal["student", "teacher", "admin"]

    is_active: Optional[bool] = True

    @model_validator(mode="after")
    def passwords_match(self):
        if(self.password != self.confirm_password):
            raise PydanticCustomError("Passwords_do_not_match", "Paswords and confirm password must be the same")
        return self


class UserLogin(UserBase):
    password: Annotated[str, AfterValidator(validate_length(6, 100, "Password"))]
    rememberMe: Optional[bool] = False


class UserRead(UserBase):
    id: int
    full_name: Optional[str] = Field(default="Not provided")
    phone_number: Optional[str] = Field(default="Not provided")
    created_at: Optional[datetime]
    is_active: bool
    role: Literal["student", "teacher", "admin"]
