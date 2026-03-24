from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, scoped_session, sessionmaker

from .config import get_database_url


Base = declarative_base()
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False)
)
_engine = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(get_database_url(), pool_pre_ping=True)
        SessionLocal.configure(bind=_engine)
    return _engine


def get_session():
    get_engine()
    return SessionLocal


def remove_session() -> None:
    SessionLocal.remove()
