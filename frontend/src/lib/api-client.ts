const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * 認証トークン付きでAPIリクエストを送信する共通クライアント。
 * Content-Type と Authorization ヘッダーを自動付与する。
 * レスポンスが ok でない場合は Error をスローする。
 */
export async function fetchWithAuth<T>(
  path: string,
  options: RequestInit,
  token: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const message =
      response.status === 401
        ? "認証エラーが発生しました。サインインし直してください。"
        : `サーバーエラー (${response.status})${errorText ? `: ${errorText}` : ""}`;
    throw Object.assign(new Error(message), { status: response.status });
  }

  return response.json() as Promise<T>;
}
