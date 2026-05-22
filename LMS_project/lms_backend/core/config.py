
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
    
settings = Settings() 