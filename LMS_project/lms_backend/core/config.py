
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

env_file=Path(__file__).resolve().parents[2] / ".env"   # absolute path
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_file,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
        )
    database_url: str = "MISSING_DATABASE_URL"
    jwt_secret: str = "MISSING_JWT_SECRET"                          # Bắt buộc, app crash nếu thiếu
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30    # Access token sống 30 phút
    refresh_token_expire_days: int = 7       # Refresh token sống 7 ngày

    is_production: bool = False  # Mặc định là False, có thể override bằng .env
    
settings = Settings() 