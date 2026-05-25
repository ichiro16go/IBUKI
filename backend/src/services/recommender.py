"""OpenAI-powered hobby recommendation service.

Takes a YouTubeProfile and returns up to 3 freshly generated HobbyRecommendation
objects — OpenAI creates the hobby names and reasons from scratch based on the
user's YouTube signals rather than selecting from a predefined catalog.
"""

import json
import logging
import os
from dataclasses import dataclass, field
from functools import lru_cache

from openai import AsyncOpenAI

from .youtube import YouTubeProfile

logger = logging.getLogger(__name__)

MAX_RECOMMENDATIONS = 3
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

    return f"""あなたはユーザーの趣味を提案するアシスタントです。

ユーザーのYouTube情報:
- チャンネル登録: {channels}
- 高評価した動画: {liked}
- プレイリスト名: {playlists}

このユーザーの興味・関心をもとに、ぴったりな趣味を{MAX_RECOMMENDATIONS}つ新しく考えて提案してください。
既存リストから選ぶのではなく、ユーザーの個性に合わせてオリジナルの趣味を生み出してください。

レスポンスは必ずJSON形式で返してください:
{{
  "recommendations": [
    {{
      "name_ja": "趣味の日本語名（10字以内）",
      "name_en": "Hobby name in English",
      "tags": ["タグ1", "タグ2", "タグ3"],
      "reason": "YouTubeの傾向からこの趣味を勧める理由（30字以内の日本語）"
    }}
  ]
}}

趣味名は短く親しみやすく、理由はYouTubeの傾向と自然につながる内容にしてください。"""


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


MAX_ACTION_RECOMMENDATIONS = 3


@dataclass(frozen=True)
class ActionRecommendation:
    title: str
    description: str
    action_type: str = "ai-recommend"


def _build_action_prompt(
    hobby_title: str, hobby_category: str, hobby_detail: str
) -> str:
    return f"""あなたはユーザーの趣味活動を具体的にサポートするアシスタントです。

趣味: {hobby_title}
カテゴリ: {hobby_category or "未設定"}
詳細: {hobby_detail or "未設定"}

この趣味に関して、ユーザーが今日・今週から実際に試せる具体的なアクションを{MAX_ACTION_RECOMMENDATIONS}つ提案してください。

ポイント:
- 各アクションは動詞始まりで具体的に（例:「〇〇を調べて動画を2本見る」「〇〇の体験教室を1件検索する」）
- 初心者でも取り組みやすいものを中心に
- 趣味名を含めた具体的な行動を含める

レスポンスは必ずJSON形式で返してください:
{{
  "recommendations": [
    {{
      "title": "具体的なアクション（50字以内）",
      "description": "補足説明（30字以内）"
    }}
  ]
}}"""


def _parse_action_response(content: str) -> list[ActionRecommendation]:
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        logger.warning("OpenAI returned invalid JSON for actions: %s", content[:200])
        return []

    results: list[ActionRecommendation] = []
    for item in data.get("recommendations", []):
        title = item.get("title", "").strip()
        description = item.get("description", "").strip()
        if title:
            results.append(ActionRecommendation(title=title, description=description))
        if len(results) >= MAX_ACTION_RECOMMENDATIONS:
            break

    return results


async def recommend_actions(
    hobby_title: str,
    hobby_category: str = "",
    hobby_detail: str = "",
) -> list[ActionRecommendation]:
    """Return up to 3 AI-generated action recommendations for a specific hobby."""
    fallback = [
        ActionRecommendation(
            title=f"{hobby_title}の動画を探して1本見る",
            description="まず視覚的に体験してみよう",
        ),
        ActionRecommendation(
            title=f"{hobby_title}の入門記事を読む",
            description="ブログや記事で情報収集",
        ),
        ActionRecommendation(
            title=f"{hobby_title}の体験教室を検索する",
            description="近くで試せる場所を探す",
        ),
    ]

    try:
        client = _get_client()
    except ValueError:
        logger.warning("OpenAI client unavailable; using fallback actions")
        return fallback

    prompt = _build_action_prompt(hobby_title, hobby_category, hobby_detail)
    logger.info("Sending action prompt to OpenAI:\n%s", prompt)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=512,
        )
    except Exception:
        logger.exception("OpenAI call failed for action recommendations")
        return fallback

    content = response.choices[0].message.content or "{}"
    logger.info("OpenAI action response: %s", content)

    recommendations = _parse_action_response(content)
    if not recommendations:
        logger.warning("No valid action recommendations parsed; using fallback")
        return fallback

    return recommendations


async def recommend_hobbies(
    profile: YouTubeProfile,
) -> list[HobbyRecommendation]:
    """Return up to 3 generated hobby recommendations based on the user's YouTube profile."""
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
        max_tokens=512,
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
