export const TOKEN_KEY = "route53_jwt_token";

/**
 * Saves the token to localStorage and synchronizes it to a cookie.
 * This allows both client-side Axios and server-side Middleware to read it.
 */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    // 1. Save to local storage
    localStorage.setItem(TOKEN_KEY, token);

    // 2. Sync to cookie (expires in 7 days)
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
  }
}

/**
 * Retrieves the token from localStorage or document.cookie.
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    // Client side: try localStorage first
    const localToken = localStorage.getItem(TOKEN_KEY);
    if (localToken) return localToken;

    // Fallback to cookies
    const match = document.cookie.match(new RegExp("(^| )" + TOKEN_KEY + "=([^;]+)"));
    if (match) return decodeURIComponent(match[2]);
  }
  return null;
}

/**
 * Clears the token from localStorage and deletes the cookie.
 */
export function removeToken(): void {
  if (typeof window !== "undefined") {
    // 1. Remove from localStorage
    localStorage.removeItem(TOKEN_KEY);

    // 2. Delete the cookie by setting max-age to 0
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax; Secure`;
  }
}
