from typing import List

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    field: str
    message: str
    type: str | None = None


class ErrorResponse(BaseModel):
    code: str
    message: str
    field: str | None = None
    errors: List[ErrorDetail] | None = None