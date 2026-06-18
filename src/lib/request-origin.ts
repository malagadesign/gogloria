import { headers } from "next/headers";

import { getAppUrl } from "@/lib/app-url";

export async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host.split(",")[0]?.trim()}`;
  }

  return getAppUrl();
}
