import Link from "next/link";

import { auth } from "@/auth";
import { EmptyState } from "@/components/dashboard/badges";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClientFilter, type AppSession } from "@/lib/permissions";
import { getDashboardScanStats } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = (await auth()) as AppSession;
  const clientFilter = getClientFilter(session);

  const [totalQrs, activeQrs, scanStats, topQrs] = await Promise.all([
      prisma.qrCode.count({ where: { client: clientFilter } }),
      prisma.qrCode.count({
        where: { client: clientFilter, status: "ACTIVE" },
      }),
      getDashboardScanStats(clientFilter),
      prisma.qrCode.findMany({
        where: { client: clientFilter },
        include: { _count: { select: { scans: true } } },
        orderBy: { scans: { _count: "desc" } },
        take: 5,
      }),
    ]);

  const { totalScans, scansLast7Days } = scanStats;

  return (
    <div>
      <PageHeader
        title="Resumen"
        description="Vista general de tus QRs, campañas y escaneos."
        actions={
          <Button asChild>
            <Link href="/dashboard/qrs/new">Nuevo QR</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total de QRs" value={totalQrs} />
        <StatCard title="QRs activos" value={activeQrs} />
        <StatCard title="Total de escaneos" value={totalScans} />
        <StatCard title="Escaneos (7 días)" value={scansLast7Days} />
      </div>

      <Card className="mt-8 border-border/60 shadow-none">
        <CardHeader>
          <CardTitle>Top 5 QRs más escaneados</CardTitle>
        </CardHeader>
        <CardContent>
          {topQrs.length === 0 ? (
            <EmptyState
              title="Todavía no hay QRs"
              description="Creá tu primer QR dinámico para empezar a medir escaneos."
              actionHref="/dashboard/qrs/new"
              actionLabel="Crear QR"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR</TableHead>
                  <TableHead>Escaneos</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topQrs.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell className="font-medium">{qr.name}</TableCell>
                    <TableCell>{qr._count.scans}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/qrs/${qr.id}`}
                        className="text-sm underline-offset-4 hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
