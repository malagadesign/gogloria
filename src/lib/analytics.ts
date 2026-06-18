import type { Prisma } from "@prisma/client";

import {
  formatChartDayLabel,
  getDateKeyInAppTimezone,
  getDateKeysForLastDays,
  getDaysAgoStartInAppTimezone,
  getStartOfDayInAppTimezone,
} from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export type ScanDayPoint = {
  date: string;
  label: string;
  count: number;
};

export async function getQrScanStats(qrCodeId: string) {
  const sevenDaysAgo = getDaysAgoStartInAppTimezone(7);
  const thirtyDaysAgo = getDaysAgoStartInAppTimezone(30);

  const [total, last7Days, last30Days] = await Promise.all([
    prisma.qrScan.count({ where: { qrCodeId } }),
    prisma.qrScan.count({
      where: { qrCodeId, scannedAt: { gte: sevenDaysAgo } },
    }),
    prisma.qrScan.count({
      where: { qrCodeId, scannedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  return { total, last7Days, last30Days };
}

export async function getDashboardScanStats(clientWhere: Prisma.ClientWhereInput) {
  const sevenDaysAgo = getDaysAgoStartInAppTimezone(7);
  const scanWhere = { qrCode: { client: clientWhere } };

  const [totalScans, scansLast7Days] = await Promise.all([
    prisma.qrScan.count({ where: scanWhere }),
    prisma.qrScan.count({
      where: { ...scanWhere, scannedAt: { gte: sevenDaysAgo } },
    }),
  ]);

  return { totalScans, scansLast7Days };
}

export async function getQrScansByDay(
  qrCodeId: string,
  days = 30,
): Promise<ScanDayPoint[]> {
  const dateKeys = getDateKeysForLastDays(days);
  const start = getStartOfDayInAppTimezone(dateKeys[0]!);

  const scans = await prisma.qrScan.findMany({
    where: {
      qrCodeId,
      scannedAt: { gte: start },
    },
    select: { scannedAt: true },
  });

  const counts = new Map<string, number>();
  for (const key of dateKeys) {
    counts.set(key, 0);
  }

  for (const scan of scans) {
    const key = getDateKeyInAppTimezone(scan.scannedAt);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return dateKeys.map((date) => ({
    date,
    label: formatChartDayLabel(date),
    count: counts.get(date) ?? 0,
  }));
}
