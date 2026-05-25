import unittest
from unittest.mock import patch

from google.auth.exceptions import RefreshError
from src.services import youtube


class _FailingExecute:
    def execute(self):
        raise RefreshError("missing refresh token")


class _FailingResource:
    def list(self, **_kwargs):
        return _FailingExecute()


class _FailingYouTube:
    def subscriptions(self):
        return _FailingResource()

    def videos(self):
        return _FailingResource()

    def playlists(self):
        return _FailingResource()


class YouTubeFetchTests(unittest.TestCase):
    def setUp(self):
        self.youtube = _FailingYouTube()

    def assert_fetch_returns_empty_list(self, fetch):
        with self.assertLogs(youtube.logger, level="WARNING"):
            self.assertEqual(fetch(self.youtube), [])

    def test_subscriptions_refresh_error_returns_empty_list(self):
        self.assert_fetch_returns_empty_list(youtube._fetch_subscriptions)

    def test_liked_videos_refresh_error_returns_empty_list(self):
        self.assert_fetch_returns_empty_list(youtube._fetch_liked_videos)

    def test_playlist_refresh_error_returns_empty_list(self):
        self.assert_fetch_returns_empty_list(youtube._fetch_playlist_names)


class YouTubeCredentialsTests(unittest.TestCase):
    @patch.dict(
        "os.environ",
        {
            "GOOGLE_CLIENT_ID": "client-id",
            "GOOGLE_CLIENT_SECRET": "client-secret",
        },
        clear=True,
    )
    def test_build_credentials_uses_refresh_token_when_configured(self):
        credentials = youtube._build_credentials(
            access_token="access-token",
            refresh_token="refresh-token",
        )

        self.assertEqual(credentials.token, "access-token")
        self.assertEqual(credentials.refresh_token, "refresh-token")
        self.assertEqual(credentials.token_uri, youtube.GOOGLE_TOKEN_URI)
        self.assertEqual(credentials.client_id, "client-id")
        self.assertEqual(credentials.client_secret, "client-secret")

    @patch.dict("os.environ", {}, clear=True)
    def test_build_credentials_without_google_config_still_uses_access_token(self):
        with self.assertLogs(youtube.logger, level="WARNING"):
            credentials = youtube._build_credentials(
                access_token="access-token",
                refresh_token="refresh-token",
            )

        self.assertEqual(credentials.token, "access-token")
        self.assertIsNone(credentials.refresh_token)


if __name__ == "__main__":
    unittest.main()
