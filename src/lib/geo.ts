export type GeoLocation = {
  country: string | null;
  city: string | null;
};

type IpInfoResponse = {
  country?: string;
  city?: string;
};

function decodeHeaderValue(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isPrivateOrLocalIp(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.startsWith("::ffff:127.")
  ) {
    return true;
  }

  if (
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    normalized.startsWith("172.16.") ||
    normalized.startsWith("172.17.") ||
    normalized.startsWith("172.18.") ||
    normalized.startsWith("172.19.") ||
    normalized.startsWith("172.2") ||
    normalized.startsWith("172.30.") ||
    normalized.startsWith("172.31.") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
    return true;
  }

  return false;
}

/**
 * Resuelve país/ciudad desde headers de plataforma.
 * Prioridad en producción: Vercel → Cloudflare
 */
export function getGeoFromHeaders(headerStore: Headers): GeoLocation {
  const vercelCountry = headerStore.get("x-vercel-ip-country");
  const cfCountry = headerStore.get("cf-ipcountry");
  const countryRaw = vercelCountry ?? cfCountry;

  const country =
    countryRaw && countryRaw !== "XX" && countryRaw.length === 2
      ? countryRaw.toUpperCase()
      : null;

  const city =
    decodeHeaderValue(headerStore.get("x-vercel-ip-city")) ??
    decodeHeaderValue(headerStore.get("cf-ipcity"));

  return { country, city };
}

async function fetchGeoFromIpinfo(
  ip: string | null,
  token: string,
): Promise<GeoLocation> {
  const useSelfLookup = !ip || isPrivateOrLocalIp(ip);
  const url = useSelfLookup
    ? `https://ipinfo.io/json?token=${encodeURIComponent(token)}`
    : `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { country: null, city: null };
    }

    const data = (await response.json()) as IpInfoResponse;

    return {
      country:
        typeof data.country === "string" && data.country.length === 2
          ? data.country.toUpperCase()
          : null,
      city: typeof data.city === "string" ? data.city : null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resuelve geolocalización con fallback a ipinfo.io.
 *
 * 1. Headers Vercel / Cloudflare (producción)
 * 2. ipinfo.io si hay IPINFO_TOKEN y faltan datos
 *    - IP pública del visitante cuando está disponible
 *    - /json (IP del servidor) en local cuando la IP es 127.0.0.1 / ::1
 */
export async function resolveGeo(
  headerStore: Headers,
  ip: string | null,
): Promise<GeoLocation> {
  const fromHeaders = getGeoFromHeaders(headerStore);

  if (fromHeaders.country && fromHeaders.city) {
    return fromHeaders;
  }

  const token = process.env.IPINFO_TOKEN?.trim();
  if (!token) {
    return fromHeaders;
  }

  try {
    const fromIpinfo = await fetchGeoFromIpinfo(ip, token);

    return {
      country: fromHeaders.country ?? fromIpinfo.country,
      city: fromHeaders.city ?? fromIpinfo.city,
    };
  } catch (error) {
    console.error("[resolveGeo] ipinfo lookup failed:", error);
    return fromHeaders;
  }
}

const COUNTRY_NAMES: Record<string, string> = {
  AR: "Argentina",
  BR: "Brasil",
  CL: "Chile",
  CO: "Colombia",
  ES: "España",
  MX: "México",
  PE: "Perú",
  US: "Estados Unidos",
  UY: "Uruguay",
};

export function formatCountry(code: string | null): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}
