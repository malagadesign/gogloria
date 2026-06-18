import { normalizeAppUrl } from "@/lib/app-url";

for (const key of ["AUTH_URL", "NEXTAUTH_URL", "NEXT_PUBLIC_QR_BASE_URL"] as const) {
  const normalized = normalizeAppUrl(process.env[key]);
  if (normalized) process.env[key] = normalized;
}
