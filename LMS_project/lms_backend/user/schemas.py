
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, model_validator
from pydantic.functional_validators import AfterValidator
from pydantic_core import PydanticCustomError


def validate_length(min_length: int, max_length: int, fieldName: str):
    def validator(value: str):
        if len(value) < min_length or len(value) > max_length:
            raise PydanticCustomError("Too_short", "{fieldName} must be at least {min_length} and at most {max_length} characters long and in correct format", {"fieldName": fieldName, "min_length": min_length, "max_length": max_length})
        return value
    return validator

class UserCreate(BaseModel):
    # email: EmailStr = Field(min_length=5, max_length=100)
    email: Annotated[EmailStr, AfterValidator(validate_length(10, 100, "Email"))]  #Reusable validator
    password: Annotated[str, AfterValidator(validate_length(6, 100, "Password"))]
    confirm_password: Annotated[str, AfterValidator(validate_length(6, 100, "Confirm Password"))]
    role: Literal["student", "teacher", "admin"]

    @model_validator(mode="after")
    def passwords_match(self):
        if(self.password != self.confirm_password):
            raise PydanticCustomError("Passwords_do_not_match", "Paswords and confirm password must be the same")
        return self


class UserLogin(BaseModel):
    email: Annotated[EmailStr, AfterValidator(validate_length(10, 100, "Email"))]  #Reusable validator
    password: Annotated[str, AfterValidator(validate_length(6, 100, "Password"))]
    rememberMe: Optional[bool] = False


class UserRead(BaseModel):
    id: int
    email: EmailStr = Field(min_length=5, max_length=100)
    full_name: Optional[str] = Field(default="Not provided")
    phone_number: Optional[str] = Field(default="Not provided")
    created_at: Optional[str] = Field(default="Not provided")
    role: Literal["student", "teacher", "admin"]
    is_active: bool