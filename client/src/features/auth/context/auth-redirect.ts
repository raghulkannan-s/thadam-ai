const DEFAULT_AUTH_REDIRECT = "/community";

export function sanitizeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (value.startsWith("/login") || value.startsWith("/register") || value.startsWith("/oauth2/redirect")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}

export function loginPathForRedirect(pathname: string): string {
  const safePath = sanitizeRedirectPath(pathname);
  return `/login?redirect=${encodeURIComponent(safePath)}`;
}
