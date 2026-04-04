import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ai_guardian_db"
    
    # JWT
    JWT_SECRET: str = "supersecret-key-1234"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Mailjet SMTP
    MAIL_USERNAME: str = "d79ea3c761ec2ee54845209e0ad93862"
    MAIL_PASSWORD: str = "example-secret"
    MAIL_FROM: str = "verified@guardian.sys"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "in-v3.mailjet.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# Async MongoDB Driver
client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.DATABASE_NAME]

def get_db():
    return db
