import os
from datetime import datetime

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    JSON
)

from sqlalchemy.orm import declarative_base, sessionmaker, relationship


# ======================================================
# 1. DATABASE CONFIGURATION
# ======================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./faq_bot.db"
)

# SQLite needs check_same_thread=False for FastAPI
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # Production database (PostgreSQL)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ======================================================
# 2. SEARCH LOG TABLE (Analytics)
# ======================================================

class SearchLog(Base):
    """
    Stores every user query and generated answer
    for analytics, monitoring, and debugging.
    """

    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)

    query = Column(Text, nullable=False, index=True)

    answer_generated = Column(Text, nullable=False)

    sources_used = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    is_deleted = Column(Boolean, default=False)

    # Relationship
    feedback = relationship(
        "Feedback",
        back_populates="log",
        cascade="all, delete-orphan"
    )


# ======================================================
# 3. FEEDBACK TABLE (CSAT / User Rating)
# ======================================================

class Feedback(Base):
    """
    Stores user feedback on generated answers.
    """

    __tablename__ = "search_feedback"

    id = Column(Integer, primary_key=True, index=True)

    log_id = Column(
        Integer,
        ForeignKey("search_logs.id", ondelete="CASCADE"),
        index=True
    )

    rating = Column(
        Integer,
        nullable=False
    )  # 1 = Bad, 2 = OK, 3 = Good

    comment = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        index=True
    )

    # Relationship back to SearchLog
    log = relationship("SearchLog", back_populates="feedback")


# ======================================================
# 4. KNOWLEDGE BASE (FAQ STORAGE)
# ======================================================

class KnowledgeItem(Base):
    """
    Stores FAQ question/answer pairs.

    This allows hybrid retrieval:
    - Vector search
    - Structured FAQ lookup
    """

    __tablename__ = "faq_knowledge"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(Text, nullable=False, index=True)

    answer = Column(Text, nullable=False)

    category = Column(
        String(100),
        default="General",
        index=True
    )

    embedding_id = Column(
        String(200),
        nullable=True
    )  # mapping to vector DB

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    is_deleted = Column(Boolean, default=False)


# ======================================================
# 5. DATABASE INITIALIZATION
# ======================================================

def init_db():
    """
    Creates all database tables.
    """
    Base.metadata.create_all(bind=engine)


# ======================================================
# 6. FASTAPI DATABASE DEPENDENCY
# ======================================================

def get_db():
    """
    Dependency used in FastAPI routes
    to get a database session.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ======================================================
# 7. SAFE INITIALIZATION
# ======================================================

if __name__ == "__main__":
    init_db()
    # Add this at the very end so tables create on import
init_db()
