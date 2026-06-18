/** Zona horaria de referencia para la agencia (Argentina, UTC-3 permanente). */
export const APP_TIMEZONE = "America/Argentina/Buenos_Aires";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Clave de día `yyyy-MM-dd` en hora Argentina. */
export function getDateKeyInAppTimezone(date: Date): string {
  return dateKeyFormatter.format(date);
}

/** Fecha/hora legible para tablas de escaneos. */
export function formatScanDateTime(date: Date): string {
  const datePart = new Intl.DateTimeFormat("es-AR", {
    timeZone: APP_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("es-AR", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart} ${timePart}`;
}

/** Etiqueta corta para gráficos (`18 jun`). */
export function formatChartDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: APP_TIMEZONE,
    day: "2-digit",
    month: "short",
  }).format(noonUtc);
}

/** Inicio del día calendario en Argentina (00:00 ART → 03:00 UTC). */
export function getStartOfDayInAppTimezone(dateKey: string): Date {
  return new Date(`${dateKey}T03:00:00.000Z`);
}

/** Últimos N días calendario en Argentina (incluye hoy). */
export function getDateKeysForLastDays(days: number): string[] {
  const keys: string[] = [];
  const todayKey = getDateKeyInAppTimezone(new Date());
  const [year, month, day] = todayKey.split("-").map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(getDateKeyInAppTimezone(d));
  }

  return keys;
}

/** Inicio del primer día del rango de los últimos N días calendario en Argentina. */
export function getDaysAgoStartInAppTimezone(days: number): Date {
  const keys = getDateKeysForLastDays(days);
  return getStartOfDayInAppTimezone(keys[0]!);
}
