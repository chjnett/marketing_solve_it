import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Meta App Credentials
    META_APP_ID: str = "mock_app_id"
    META_APP_SECRET: str = "mock_app_secret"
    META_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/threads/callback"
    
    # Gemini API Key
    GEMINI_API_KEY: str = ""
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./threadpulse.db"
    DB_MODE: str = "local"  # local or d1
    ENABLE_MOCK_DATA: bool = False
    
    # Cloudflare D1 Credentials (Required if DB_MODE is "d1")
    CLOUDFLARE_ACCOUNT_ID: str = ""
    CLOUDFLARE_DATABASE_ID: str = ""
    CLOUDFLARE_API_TOKEN: str = ""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
