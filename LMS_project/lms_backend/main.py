from core.error_handlers import register_error_handlers
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from user.router import router as user_router

app = FastAPI()
register_error_handlers(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(user_router)