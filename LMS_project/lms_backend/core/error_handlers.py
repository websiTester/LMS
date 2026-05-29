
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def register_error_handlers(app: FastAPI):
    # Pydantic ValidationError → format chuẩn
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for error in exc.errors():
            errors.append({
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"]
            })
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "errors": errors
            }
        )
    
    # HTTPException → format chuẩn
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        
        code = exc.detail.get("code") if isinstance(exc.detail, dict) else "HTTP_ERROR"
        message = exc.detail.get("message") if isinstance(exc.detail, dict) else None
        field = exc.detail.get("field") if isinstance(exc.detail, dict) else None

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "code": code,
                "message": "Server validation error",
                "errors": [
                    {
                        "field": field,
                        "message": message,
                        "type": code
                    }
                ]
            }
        )
