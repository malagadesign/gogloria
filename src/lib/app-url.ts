/** Ensures env URLs always include a protocol (NextAuth requires a valid absolute URL). */
export function normalizeAppUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;

  const trimmed = url.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

export function getAppUrl(fallback = "http://localhost:3000"): string {
  return (
    normalizeAppUrl(process.env.AUTH_URL) ??
    normalizeAppUrl(process.env.NEXT_PUBLIC_QR_BASE_URL) ??
    normalizeAppUrl(process.env.VERCEL_URL) ??
    fallback
  );
}
