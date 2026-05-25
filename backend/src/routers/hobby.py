"""Hobby recommendation router.

POST /api/hobby/recommend
  - Validates the caller's Supabase JWT via /auth/v1/user
  - Fetches YouTube signals using the Google provider token
  - Returns up to 3 AI-generated hobby recommendations
"""

import logging
import os

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel

from src.services.recommender import HobbyRecommendation, recommend_hobbies
from src.services.youtube import build_youtube_profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/hobby", tags=["hobby"])


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class RecommendRequest(BaseModel):
    google_access_token: str
    existing_hobby_ids: list[str] = []


class RecommendationItem(BaseModel):
    hobby_id: str
    reason: str


class RecommendResponse(BaseModel):
    recommendations: list[RecommendationItem]


# ---------------------------------------------------------------------------
# Auth dependency
# ---------------------------------------------------------------------------


async def verify_supabase_token(authorization: str = Header(...)) -> None:
    """Validate the Supabase JWT by calling /auth/v1/user."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must start with 'Bearer '",
        )

    token = authorization.removeprefix("Bearer ").strip()

    supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    supabase_anon_key = os.environ.get("SUPABASE_ANON_KEY", "")

    if not supabase_url or not supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase is not configured on the server",
        )

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": supabase_anon_key,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Supabase token",
        )


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post(
    "/recommend",
    response_model=RecommendResponse,
    summary="AI hobby recommendations from YouTube",
)
async def get_hobby_recommendations(
    body: RecommendRequest,
    _: None = Depends(verify_supabase_token),
) -> RecommendResponse:
    """
    Accepts a Google provider token and the user's existing hobby IDs.
    Returns up to 3 hobby recommendations based on YouTube signals + OpenAI.
    """
    profile = await build_youtube_profile(body.google_access_token)
    recommendations: list[HobbyRecommendation] = await recommend_hobbies(
        profile, body.existing_hobby_ids
    )

    return RecommendResponse(
        recommendations=[
            RecommendationItem(hobby_id=r.hobby_id, reason=r.reason)
            for r in recommendations
        ]
    )
