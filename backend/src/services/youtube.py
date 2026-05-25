"""YouTube Data API v3 service.

Fetches three interest signals for a signed-in user:
  - Subscribed channels  (channel names)
  - Liked videos         (video titles)
  - Playlists            (playlist names)

All three calls are issued concurrently; individual failures are swallowed so a
missing scope or empty list never crashes the recommendation flow.
"""

import asyncio
import logging
from dataclasses import dataclass, field

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

MAX_RESULTS = 50
MAX_PLAYLISTS = 20


@dataclass(frozen=True)
class YouTubeProfile:
    subscribed_channels: list[str] = field(default_factory=list)
    liked_video_titles: list[str] = field(default_factory=list)
    playlist_names: list[str] = field(default_factory=list)

    def is_empty(self) -> bool:
        return not (
            self.subscribed_channels
            or self.liked_video_titles
            or self.playlist_names
        )


def _build_service(access_token: str):
    credentials = Credentials(token=access_token)
    return build("youtube", "v3", credentials=credentials, cache_discovery=False)


def _fetch_subscriptions(youtube) -> list[str]:
    try:
        resp = (
            youtube.subscriptions()
            .list(part="snippet", mine=True, maxResults=MAX_RESULTS)
            .execute()
        )
        return [item["snippet"]["title"] for item in resp.get("items", [])]
    except HttpError as exc:
        logger.warning("YouTube subscriptions fetch failed: %s", exc)
        return []


def _fetch_liked_videos(youtube) -> list[str]:
    try:
        resp = (
            youtube.videos()
            .list(part="snippet", myRating="like", maxResults=MAX_RESULTS)
            .execute()
        )
        return [item["snippet"]["title"] for item in resp.get("items", [])]
    except HttpError as exc:
        logger.warning("YouTube liked videos fetch failed: %s", exc)
        return []


def _fetch_playlist_names(youtube) -> list[str]:
    try:
        resp = (
            youtube.playlists()
            .list(part="snippet", mine=True, maxResults=MAX_PLAYLISTS)
            .execute()
        )
        return [item["snippet"]["title"] for item in resp.get("items", [])]
    except HttpError as exc:
        logger.warning("YouTube playlists fetch failed: %s", exc)
        return []


async def build_youtube_profile(access_token: str) -> YouTubeProfile:
    """Build a YouTubeProfile by fetching all three signals concurrently."""
    youtube = _build_service(access_token)
    loop = asyncio.get_event_loop()

    subscriptions, liked_videos, playlists = await asyncio.gather(
        loop.run_in_executor(None, _fetch_subscriptions, youtube),
        loop.run_in_executor(None, _fetch_liked_videos, youtube),
        loop.run_in_executor(None, _fetch_playlist_names, youtube),
    )

    return YouTubeProfile(
        subscribed_channels=subscriptions,
        liked_video_titles=liked_videos,
        playlist_names=playlists,
    )
