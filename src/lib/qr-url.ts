import { getAppUrl, normalizeAppUrl } from "@/lib/app-url";
import { getRequestOrigin } from "@/lib/request-origin";

export function getQrPublicUrl(slug: string, origin?: string): string {
  const base =
    normalizeAppUrl(process.env.NEXT_PUBLIC_QR_BASE_URL) ??
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : undefined) ??
    getAppUrl();

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
    normalizeAppUrl(process.env.NEXT_PUBLIC_QR_BASE_URL) ??
    origin?.replace(/\/$/, "") ??
    getAppUrl();

  return `${base}/qr-unavailable`;
}
