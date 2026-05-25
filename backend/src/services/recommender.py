"""OpenAI-powered YouTube interest inference service.

Takes a YouTubeProfile and returns up to 5 inferred HobbyRecommendation
objects. The API shape still says "recommendations" for compatibility, but the
model is prompted to surface interests visible in the user's YouTube history.
"""

import json
import logging
import os
from dataclasses import dataclass, field
from functools import lru_cache

from openai import AsyncOpenAI

from .youtube import YouTubeProfile

logger = logging.getLogger(__name__)

MAX_RECOMMENDATIONS = 5
PROMPT_CHANNEL_LIMIT = 30
PROMPT_VIDEO_LIMIT = 30
PROMPT_PLAYLIST_LIMIT = 20

FALLBACK_HOBBIES: list[dict] = [
    {
        "name_ja": "フィルムカメラ",
        "name_en": "Film Camera",
        "tags": ["写真", "散歩", "レトロ"],
    },
    {"name_ja": "陶芸", "name_en": "Pottery", "tags": ["手仕事", "集中", "土"]},
    {"name_ja": "ジャズ喫茶", "name_en": "Jazz Kissa", "tags": ["音楽", "街歩き"]},
    {"name_ja": "街歩き", "name_en": "City Walks", "tags": ["散策", "発見", "写真"]},
    {
        "name_ja": "料理探究",
        "name_en": "Cooking Exploration",
        "tags": ["食", "実験", "日常"],
    },
]


@dataclass(frozen=True)
class HobbyRecommendation:
    name_ja: str
    name_en: str
    tags: list[str] = field(default_factory=list)
    reason: str = ""


@lru_cache(maxsize=1)
def _get_client() -> AsyncOpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set")
    return AsyncOpenAI(api_key=api_key)


def _build_prompt(profile: YouTubeProfile) -> str:
    channels = ", ".join(profile.subscribed_channels[:PROMPT_CHANNEL_LIMIT]) or "なし"
    liked = ", ".join(profile.liked_video_titles[:PROMPT_VIDEO_LIMIT]) or "なし"
    playlists = ", ".join(profile.playlist_names[:PROMPT_PLAYLIST_LIMIT]) or "なし"

    return f"""あなたはYouTube履歴からユーザーの興味・関心を読み解くアシスタントです。

ユーザーのYouTube情報:
- チャンネル登録: {channels}
- 高評価した動画: {liked}
- プレイリスト名: {playlists}

この履歴から分かるユーザーの興味・関心を{MAX_RECOMMENDATIONS}つ推定してください。
動画名やチャンネル名をそのまま並べるのではなく、その背後にある好み・関心テーマへ抽象化してください。
根拠が薄い一般的な趣味提案ではなく、YouTube上の行動から自然に読み取れる内容にしてください。

レスポンスは必ずJSON形式で返してください:
{{
  "recommendations": [
    {{
      "name_ja": "興味の日本語名（10字以内）",
      "name_en": "Interest name in English",
      "tags": ["タグ1", "タグ2", "タグ3"],
      "reason": "そう推定した理由（40字以内の日本語）"
    }}
  ]
}}

興味名は短く親しみやすく、理由はYouTube履歴とのつながりが分かる内容にしてください。"""


def _parse_response(content: str) -> list[HobbyRecommendation]:
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        logger.warning("OpenAI returned invalid JSON: %s", content[:200])
        return []

    results: list[HobbyRecommendation] = []
    for item in data.get("recommendations", []):
        name_ja = item.get("name_ja", "").strip()
        name_en = item.get("name_en", "").strip()
        tags = item.get("tags", [])
        reason = item.get("reason", "").strip()
        if name_ja and name_en and reason:
            results.append(
                HobbyRecommendation(
                    name_ja=name_ja,
                    name_en=name_en,
                    tags=tags if isinstance(tags, list) else [],
                    reason=reason,
                )
            )
        if len(results) >= MAX_RECOMMENDATIONS:
            break

    return results


def _fallback_recommendations() -> list[HobbyRecommendation]:
    """Return popular hobbies when YouTube data is unavailable."""
    return [
        HobbyRecommendation(
            name_ja=h["name_ja"],
            name_en=h["name_en"],
            tags=h["tags"],
            reason="人気の趣味としておすすめです",
        )
        for h in FALLBACK_HOBBIES[:MAX_RECOMMENDATIONS]
    ]


async def recommend_hobbies(
    profile: YouTubeProfile,
) -> list[HobbyRecommendation]:
    """Return up to 5 inferred interests based on the user's YouTube profile."""
    if profile.is_empty():
        logger.info("YouTubeProfile is empty; using fallback recommendations")
        return _fallback_recommendations()

    client = _get_client()
    prompt = _build_prompt(profile)
    logger.info("Sending prompt to OpenAI:\n%s", prompt)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.7,
        max_tokens=768,
    )

    content = response.choices[0].message.content or "{}"
    logger.info("OpenAI raw response: %s", content)

    recommendations = _parse_response(content)
    logger.info(
        "Parsed recommendations: %s",
        [(r.name_ja, r.reason) for r in recommendations],
    )

    if not recommendations:
        logger.warning("OpenAI returned no valid recommendations; using fallback")
        return _fallback_recommendations()

    return recommendations
