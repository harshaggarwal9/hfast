from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):

    DATABASE_URL: str
    SMTP_SERVICE: str
    SMTP_USER: str
    SMTP_USER_PASS: str
    RAZORPAY_KEY_ID: str
    RAZORPAY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str
    FIREBASE_CREDENTIALS: str

    model_config = SettingsConfigDict(env_file=".env",env_file_encoding="utf-8",extra="forbid")

settings = Settings()
