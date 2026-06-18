import { getRequestOrigin } from "@/lib/request-origin";

export function getQrPublicUrl(slug: string, origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_QR_BASE_URL?.replace(/\/$/, "") ??
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : undefined) ??
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return `${base}/r/${slug}`;
}

export async function getQrPublicUrlForRequest(slug: string): Promise<string> {
  const origin = await getRequestOrigin();
  return getQrPublicUrl(slug, origin);
}

export function getQrShortPath(slug: string): string {
  return `/r/${slug}`;
}

export function getQrUnavailableUrl(origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_QR_BASE_URL?.replace(/\/$/, "") ??
    origin?.replace(/\/$/, "") ??
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return `${base}/qr-unavailable`;
}
