import Link from "next/link";

import { auth } from "@/auth";
import { StatusBadge, TypeBadge, EmptyState } from "@/components/dashboard/badges";
import { PageHeader } from "@/components/dashboard/page-header";
import { QrFiltersForm } from "@/components/qrs/qr-filters-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isAdmin, getClientFilter, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  buildQrListOrderBy,
  buildQrListWhere,
  type QrListSearchParams,
} from "@/lib/qr-filters";
import { getQrShortPath } from "@/lib/qr-url";

type QrsPageProps = {
  searchParams: Promise<QrListSearchParams>;
};

export default async function QrsPage({ searchParams }: QrsPageProps) {
  const session = (await auth()) as AppSession;
  const filters = await searchParams;
  const clientFilter = getClientFilter(session);
  const where = buildQrListWhere(session, filters);
  const orderBy = buildQrListOrderBy(filters.sort);

  const [qrs, clients, campaigns] = await Promise.all([
    prisma.qrCode.findMany({
      where,
      include: {
        client: true,
        campaign: true,
        _count: { select: { scans: true } },
      },
      orderBy,
    }),
    prisma.client.findMany({
      where: clientFilter,
      orderBy: { name: "asc" },
    }),
    prisma.campaign.findMany({
      where: { client: clientFilter },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="QRs"
        description="Administrá enlaces cortos dinámicos y sus destinos."
        actions={
          <Button asChild>
            <Link href="/dashboard/qrs/new">Nuevo QR</Link>
          </Button>
        }
      />

      <QrFiltersForm
        filters={filters}
        clients={clients}
        campaigns={campaigns}
        isAdmin={isAdmin(session)}
        resultCount={qrs.length}
      />

      {qrs.length === 0 ? (
        <EmptyState
          title="No hay QRs con estos filtros"
          description="Probá ajustar la búsqueda o limpiar los filtros activos."
          actionHref="/dashboard/qrs"
          actionLabel="Ver todos los QRs"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>QR</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Campaña</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Escaneos</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrs.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{qr.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getQrShortPath(qr.slug)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{qr.client.name}</TableCell>
                  <TableCell>{qr.campaign?.name ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={qr.status} />
                      <TypeBadge type={qr.type} />
                    </div>
                  </TableCell>
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
        </div>
      )}
    </div>
  );
}
