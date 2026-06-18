import { headers } from "next/headers";

export async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host.split(",")[0]?.trim()}`;
  }

  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_QR_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
