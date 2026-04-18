import os
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

# -----------------------------
# DATABASE CONFIG
# -----------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/postgres"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# -----------------------------
# SEARCH LOG TABLE
# -----------------------------
class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(500), nullable=False)
    answer_generated = Column(Text, nullable=False)
    sources_used = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to feedback
    feedback = relationship("Feedback", back_populates="log")


# -----------------------------
# FEEDBACK TABLE
# -----------------------------
class Feedback(Base):
    __tablename__ = "search_feedback"

    id = Column(Integer, primary_key=True, index=True)

    log_id = Column(
        Integer,
        ForeignKey("search_logs.id", ondelete="CASCADE"),
        index=True
    )

    is_helpful = Column(Boolean, nullable=False)
    comment = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to log
    log = relationship("SearchLog", back_populates="feedback")


# -----------------------------
# CREATE TABLES
# -----------------------------
Base.metadata.create_all(bind=engine)


# -----------------------------
# DB SESSION DEPENDENCY
# -----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
