from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/plush_toy_db"
    SECRET_KEY: str = "your-secret-key-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    UPLOAD_DIR: str = "uploads"

    # 火山引擎 TOS 对象存储
    TOS_ACCESS_KEY: str = ""
    TOS_SECRET_KEY: str = ""
    TOS_BUCKET: str = "dpshow"
    TOS_REGION: str = "cn-shanghai"
    TOS_ENDPOINT: str = "tos-cn-shanghai.volces.com"

    class Config:
        env_file = ".env"


settings = Settings()
