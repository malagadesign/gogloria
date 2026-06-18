import type { QrCodeStatus } from "@prisma/client";

type QrRedirectFields = {
  status: QrCodeStatus;
  expiresAt: Date | null;
};

export function isQrRedirectAvailable(qr: QrRedirectFields): boolean {
  if (qr.status === "PAUSED" || qr.status === "EXPIRED") {
    return false;
  }

  if (qr.expiresAt && qr.expiresAt <= new Date()) {
    return false;
  }

  return qr.status === "ACTIVE";
}

export function getQrUnavailableReason(qr: QrRedirectFields | null): string {
  if (!qr) return "not_found";
  if (qr.status === "PAUSED") return "paused";
  if (qr.status === "EXPIRED") return "expired";
  if (qr.expiresAt && qr.expiresAt <= new Date()) return "expired";
  return "unknown";
}
