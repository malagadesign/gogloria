import type { Prisma, QrCodeStatus, QrCodeType } from "@prisma/client";

import type { AppSession } from "@/lib/permissions";
import { getClientFilter } from "@/lib/permissions";

export type QrListSearchParams = {
  clientId?: string;
  campaignId?: string;
  status?: string;
  type?: string;
  q?: string;
  sort?: string;
  scans?: string;
};

export type QrSortOption =
  | "updated"
  | "created"
  | "name"
  | "scans"
  | "scans-asc";

const VALID_STATUSES: QrCodeStatus[] = ["ACTIVE", "PAUSED", "EXPIRED"];
const VALID_TYPES: QrCodeType[] = [
  "WEBSITE",
  "WHATSAPP",
  "MENU",
  "REVIEWS",
  "PDF",
  "FORM",
  "PROPERTY",
  "EVENT",
  "OTHER",
];

export function buildQrListWhere(
  session: AppSession,
  filters: QrListSearchParams,
): Prisma.QrCodeWhereInput {
  const where: Prisma.QrCodeWhereInput = {
    client: getClientFilter(session),
  };

  if (session.user.role === "ADMIN" && filters.clientId) {
    where.clientId = filters.clientId;
  }

  if (filters.campaignId) {
    where.campaignId = filters.campaignId;
  }

  if (filters.status && VALID_STATUSES.includes(filters.status as QrCodeStatus)) {
    where.status = filters.status as QrCodeStatus;
  }

  if (filters.type && VALID_TYPES.includes(filters.type as QrCodeType)) {
    where.type = filters.type as QrCodeType;
  }

  const query = filters.q?.trim();
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { destinationUrl: { contains: query, mode: "insensitive" } },
    ];
  }

  if (filters.scans === "with") {
    where.scans = { some: {} };
  } else if (filters.scans === "without") {
    where.scans = { none: {} };
  }

  return where;
}

export function buildQrListOrderBy(
  sort?: string,
): Prisma.QrCodeOrderByWithRelationInput {
  switch (sort as QrSortOption) {
    case "created":
      return { createdAt: "desc" };
    case "name":
      return { name: "asc" };
    case "scans":
      return { scans: { _count: "desc" } };
    case "scans-asc":
      return { scans: { _count: "asc" } };
    case "updated":
    default:
      return { updatedAt: "desc" };
  }
}

export function countActiveFilters(filters: QrListSearchParams): number {
  let count = 0;
  if (filters.clientId) count++;
  if (filters.campaignId) count++;
  if (filters.status) count++;
  if (filters.type) count++;
  if (filters.q?.trim()) count++;
  if (filters.scans) count++;
  if (filters.sort && filters.sort !== "updated") count++;
  return count;
}

export function buildQrListQuery(filters: QrListSearchParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value?.trim()) {
      params.set(key, value.trim());
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
