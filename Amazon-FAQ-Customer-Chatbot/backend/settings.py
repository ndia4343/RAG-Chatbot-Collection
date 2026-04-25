from pydantic import BaseModel, Field


class RAGSettings(BaseModel):
    # LLM Model (HuggingFace or local)
    model: str = Field(
        default="mistralai/Mistral-7B-Instruct-v0.2",
        description="LLM model used for generation"
    )

    # Controls creativity of AI
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Controls randomness of AI responses"
    )

    # How many chunks retrieved from FAISS
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of documents retrieved from vector DB"
    )

    # Minimum confidence required to trust answer
    confidence_threshold: float = Field(
        default=0.6,
        ge=0.0,
        le=1.0,
        description="Minimum confidence for valid response"
    )


# -----------------------------
# GLOBAL SETTINGS INSTANCE
# -----------------------------
settings = RAGSettings()


# -----------------------------
# UPDATE SETTINGS FUNCTION (SAAS SAFE)
# -----------------------------
def update_settings(data: dict):
    global settings

    settings = RAGSettings(**{
        **settings.dict(),
        **data
    })

    return settings


# -----------------------------
# GET SETTINGS
# -----------------------------
def get_settings():
    return settings
