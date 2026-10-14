/**
 * Normalize a URL to canonical format:
 * - Preserves origin and pathname
 * - Removes query strings and fragments (?foo=bar#section) to protect user privacy
 * - Strips trailing slashes (except root "/")
 * - Lowercases hostname
 */
export function normalizeCanonicalUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '/';
  }

  try {
    // If it's a relative path like "/products", parse with a dummy base
    const isRelative = rawUrl.startsWith('/') || !rawUrl.includes('://');
    const parsed = isRelative
      ? new URL(rawUrl, 'http://localhost')
      : new URL(rawUrl);

    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    if (isRelative) {
      return pathname || '/';
    }

    return `${parsed.protocol}//${parsed.host.toLowerCase()}${pathname}`;
  } catch (e) {
    // Fallback: strip query and hash via regex
    const stripped = rawUrl.split(/[?#]/)[0];
    return stripped.length > 1 && stripped.endsWith('/')
      ? stripped.slice(0, -1)
      : stripped;
  }
}
