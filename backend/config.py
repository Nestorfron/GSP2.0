import os
from dotenv import load_dotenv # type: ignore
from sqlalchemy.pool import NullPool # type: ignore

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key")

    # 🔧 Supabase Free — SIN pooling
    SQLALCHEMY_ENGINE_OPTIONS = {
        "poolclass": NullPool
    }

    # Correo
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() in ["true", "1", "yes"]
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = (
        os.getenv("MAIL_DEFAULT_SENDER_NAME", "Nombre App"),
        os.getenv("MAIL_DEFAULT_SENDER_EMAIL", "tu_email@gmail.com")
    )
