"""OpenAI-powered hobby recommendation service.

Takes a YouTubeProfile and a list of already-owned hobby IDs,
returns up to 3 HobbyRecommendation objects with a short Japanese reason.
"""

import json
import logging
import os
from dataclasses import dataclass
from functools import lru_cache

from openai import AsyncOpenAI

from .youtube import YouTubeProfile

logger = logging.getLogger(__name__)

# Hobby catalog mirrors frontend/src/data/ibuki.ts
HOBBY_CATALOG: list[dict] = [
    {"id": "film-camera", "nameJa": "フィルムカメラ", "tags": ["散歩", "写真", "レトロ"]},
    {"id": "togei", "nameJa": "陶芸", "tags": ["手仕事", "集中", "土"]},
    {"id": "jazz-kissa", "nameJa": "ジャズ喫茶", "tags": ["音楽", "街歩き"]},
    {"id": "birdwatching", "nameJa": "野鳥観察", "tags": ["自然", "朝"]},
    {"id": "tanka", "nameJa": "短歌", "tags": ["言葉"]},
    {"id": "board-game", "nameJa": "ボードゲーム", "tags": ["人と", "戦略"]},
    {"id": "sauna", "nameJa": "サウナ巡り", "tags": ["整う", "夜"]},
    {"id": "bookstores", "nameJa": "本屋散歩", "tags": ["街歩き", "本"]},
]

FALLBACK_IDS = ["film-camera", "togei", "jazz-kissa"]
MAX_RECOMMENDATIONS = 3
PROMPT_CHANNEL_LIMIT = 30
PROMPT_VIDEO_LIMIT = 30
PROMPT_PLAYLIST_LIMIT = 20


@dataclass(frozen=True)
class HobbyRecommendation:
    hobby_id: str
    reason: str


@lru_cache(maxsize=1)
def _get_client() -> AsyncOpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set")
    return AsyncOpenAI(api_key=api_key)


def _build_prompt(profile: YouTubeProfile, available: list[dict]) -> str:
    channels = ", ".join(profile.subscribed_channels[:PROMPT_CHANNEL_LIMIT]) or "なし"
    liked = ", ".join(profile.liked_video_titles[:PROMPT_VIDEO_LIMIT]) or "なし"
    playlists = ", ".join(profile.playlist_names[:PROMPT_PLAYLIST_LIMIT]) or "なし"
    catalog = json.dumps(available, ensure_ascii=False)

    return f"""あなたはユーザーの趣味を分析するアシスタントです。

ユーザーのYouTube情報:
- チャンネル登録: {channels}
- 高評価した動画: {liked}
- プレイリスト名: {playlists}

以下の趣味カタログから、ユーザーの興味に最も合う{MAX_RECOMMENDATIONS}つを選んでください:
{catalog}

レスポンスは必ずJSON形式で返してください:
{{"recommendations": [{{"hobby_id": "...", "reason": "（30字以内の日本語で推薦理由）"}}]}}

YouTubeの傾向から自然につながる趣味を選び、理由は30字以内の日本語で書いてください。
データが少ない場合は、人気のある趣味を推薦してください。"""


def _parse_response(content: str, available: list[dict]) -> list[HobbyRecommendation]:
    available_ids = {h["id"] for h in available}
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        logger.warning("OpenAI returned invalid JSON: %s", content[:200])
        return []

    results: list[HobbyRecommendation] = []
    for item in data.get("recommendations", []):
        hobby_id = item.get("hobby_id", "")
        reason = item.get("reason", "")
        if hobby_id in available_ids and reason:
            results.append(HobbyRecommendation(hobby_id=hobby_id, reason=reason))
        if len(results) >= MAX_RECOMMENDATIONS:
            break

    return results


def _fallback_recommendations(
    available: list[dict],
) -> list[HobbyRecommendation]:
    """Return up to 3 popular hobbies when YouTube data is empty."""
    results: list[HobbyRecommendation] = []
    available_ids = {h["id"] for h in available}
    for fid in FALLBACK_IDS:
        if fid in available_ids:
            results.append(
                HobbyRecommendation(
                    hobby_id=fid,
                    reason="人気の趣味としておすすめです",
                )
            )
        if len(results) >= MAX_RECOMMENDATIONS:
            break
    return results


async def recommend_hobbies(
    profile: YouTubeProfile,
    existing_hobby_ids: list[str],
) -> list[HobbyRecommendation]:
    """Return up to 3 hobby recommendations based on the user's YouTube profile."""
    available = [h for h in HOBBY_CATALOG if h["id"] not in existing_hobby_ids]
    if not available:
        return []

    if profile.is_empty():
        logger.info("YouTubeProfile is empty; using fallback recommendations")
        return _fallback_recommendations(available)

    client = _get_client()
    prompt = _build_prompt(profile, available)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.7,
        max_tokens=512,
    )

    content = response.choices[0].message.content or "{}"
    recommendations = _parse_response(content, available)

    if not recommendations:
        logger.warning("OpenAI returned no valid recommendations; using fallback")
        return _fallback_recommendations(available)

    return recommendations
