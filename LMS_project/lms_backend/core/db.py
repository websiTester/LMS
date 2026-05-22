from core.config import settings
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

# DATABASE_URL = _raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
#postgresql+asyncpg://user:pass@127.0.0.1:5431/lms_db
print(f"{settings.database_url}")
engine = create_async_engine(settings.database_url)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:   # async with -> ensures proper cleanup of the session after use
        yield session

# SIMILAR TO: 
# async def get_db():
#     session = AsyncSessionLocal()
#     try:
#         yield session     
#     finally:
#         await session.close()   # Ensure the session is closed after use


# get_db()
# print("Database session created")