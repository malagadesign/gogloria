import { createHash } from "crypto";
import type { DeviceType } from "@prisma/client";

import { resolveGeo } from "@/lib/geo";
import { prisma } from "@/lib/prisma";

const BOT_PATTERNS = [
  "bot",
  "crawler",
  "spider",
  "preview",
  "facebookexternalhit",
  "whatsapp",
  "slackbot",
  "telegrambot",
];

export function getClientIp(headerStore: Headers): string | null {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }

  const realIp = headerStore.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = headerStore.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return null;
}

export function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET ?? "qr-studio-fallback";
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex");
}

export function detectDeviceType(userAgent: string | null): DeviceType {
  const ua = (userAgent ?? "").toLowerCase();

  if (!ua) {
    return "UNKNOWN";
  }

  if (BOT_PATTERNS.some((pattern) => ua.includes(pattern))) {
    return "BOT";
  }

  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) {
    return "TABLET";
  }

  if (/mobile|iphone|ipod|android.*mobile|blackberry|windows phone/.test(ua)) {
    return "MOBILE";
  }

  if (/windows|macintosh|linux|cros|x11/.test(ua)) {
    return "DESKTOP";
  }

  return "UNKNOWN";
}

export function parseBrowser(userAgent: string | null): string | null {
  const ua = userAgent ?? "";
  if (!ua) return null;

  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";

  return "Otro";
}

export function parseOs(userAgent: string | null): string | null {
  const ua = userAgent ?? "";
  if (!ua) return null;

  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";

  return "Otro";
}

export async function recordScan(
  qrCodeId: string,
  headerStore: Headers,
): Promise<void> {
  try {
    const userAgent = headerStore.get("user-agent");
    const referer = headerStore.get("referer");
    const ip = getClientIp(headerStore);
    const geo = await resolveGeo(headerStore, ip);

    await prisma.qrScan.create({
      data: {
        qrCodeId,
        userAgent: userAgent || null,
        referer: referer || null,
        deviceType: detectDeviceType(userAgent),
        browser: parseBrowser(userAgent),
        os: parseOs(userAgent),
        ipHash: ip ? hashIp(ip) : null,
        country: geo.country,
        city: geo.city,
      },
    });
  } catch (error) {
    console.error("[recordScan] Failed to record scan:", error);
  }
}
