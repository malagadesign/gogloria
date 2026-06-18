import type { QrCodeStatus, QrCodeType, DeviceType } from "@prisma/client";

export const QR_TYPE_LABELS: Record<QrCodeType, string> = {
  WEBSITE: "Sitio web",
  WHATSAPP: "WhatsApp",
  MENU: "Menú digital",
  REVIEWS: "Google Reviews",
  PDF: "PDF / Brochure",
  FORM: "Formulario",
  PROPERTY: "Ficha de propiedad",
  EVENT: "Evento",
  OTHER: "Otro",
};

export const QR_STATUS_LABELS: Record<QrCodeStatus, string> = {
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  EXPIRED: "Expirado",
};

export const ROLE_LABELS = {
  ADMIN: "Administrador",
  CLIENT: "Cliente",
} as const;

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  MOBILE: "Móvil",
  DESKTOP: "Escritorio",
  TABLET: "Tablet",
  BOT: "Bot",
  UNKNOWN: "Desconocido",
};
