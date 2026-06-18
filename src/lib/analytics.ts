import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ScanDayPoint = {
  date: string;
  label: string;
  count: number;
};

export async function getQrScanStats(qrCodeId: string) {
  const sevenDaysAgo = subDays(new Date(), 7);
  const thirtyDaysAgo = subDays(new Date(), 30);

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
  const sevenDaysAgo = subDays(new Date(), 7);
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = subDays(today, days - 1);

  const scans = await prisma.qrScan.findMany({
    where: {
      qrCodeId,
      scannedAt: { gte: start },
    },
    select: { scannedAt: true },
  });

  const counts = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    const day = subDays(today, days - 1 - i);
    counts.set(format(day, "yyyy-MM-dd"), 0);
  }

  for (const scan of scans) {
    const key = format(scan.scannedAt, "yyyy-MM-dd");
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({
    date,
    label: format(new Date(`${date}T12:00:00`), "dd MMM", { locale: es }),
    count,
  }));
}
