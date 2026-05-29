from core.error_handlers import register_error_handlers
from course.router import router as course_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from user.router import router as user_router

app = FastAPI(
    swagger_ui_parameters={"withCredentials": True}  # ← Swagger gửi kèm cookie
)
register_error_handlers(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(user_router)
app.include_router(course_router)