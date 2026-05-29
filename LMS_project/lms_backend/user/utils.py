from pydantic_core import PydanticCustomError


def validate_length(min_length: int, max_length: int, fieldName: str):
    def validator(value: str):
        if len(value) < min_length or len(value) > max_length:
            raise PydanticCustomError("Too_short", "{fieldName} must be at least {min_length} and at most {max_length} characters long and in correct format", {"fieldName": fieldName, "min_length": min_length, "max_length": max_length})
        return value
    return validator