/** Identidad visual alineada con el ecosistema Agencia Gloria (ads-metrics). */

export const LOGO_PATHS = {
  dark: "/brand/go-dark.svg",
  light: "/brand/go-light.svg",
} as const;

export const AGENCY_LOGO_PATH = "/logo-agencia.svg";

export const LOGO_ALT = "QR Studio";
export const AGENCY_LOGO_ALT = "Agencia Gloria";
export const PRODUCT_NAME = "QR Studio";
export const BRAND_TAGLINE = "QRs dinámicos con medición";
export const DEVELOPER_CREDIT = "Desarrollado por Málaga Design";

/** Rojo Gloria */
export const BRAND_COLOR = "#ff1f00";
/** Negro tinta */
export const BRAND_INK = "#1d1d1b";

export const LOGO_ASPECT_RATIO = 74.62 / 81.81;
export const AGENCY_LOGO_ASPECT_RATIO = 127.8 / 97.8;

export function logoHeightForWidth(width: number): number {
  return Math.round(width / LOGO_ASPECT_RATIO);
}

export function agencyLogoHeightForWidth(width: number): number {
  return Math.round(width / AGENCY_LOGO_ASPECT_RATIO);
}
