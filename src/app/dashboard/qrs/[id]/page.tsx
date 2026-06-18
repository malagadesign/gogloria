import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { auth } from "@/auth";
import { StatusBadge, TypeBadge } from "@/components/dashboard/badges";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CopyLinkButton } from "@/components/qrs/copy-link-button";
import { QrPreview } from "@/components/qrs/qr-preview";
import { QrScansChart } from "@/components/qrs/qr-scans-chart";
import { DeleteConfirmButton } from "@/components/dashboard/delete-confirm-button";
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
import { getQrScanStats, getQrScansByDay } from "@/lib/analytics";
import { deleteQrCode } from "@/lib/actions/qrs";
import { formatCountry } from "@/lib/geo";
import { DEVICE_TYPE_LABELS, QR_STATUS_LABELS } from "@/lib/labels";
import { canAccessClient, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getQrPublicUrlForRequest, getQrShortPath } from "@/lib/qr-url";

type QrDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatLocation(country: string | null, city: string | null): string {
  const countryLabel = formatCountry(country) ?? country;
  if (city && countryLabel) return `${city}, ${countryLabel}`;
  if (countryLabel) return countryLabel;
  if (city) return city;
  return "—";
}

export default async function QrDetailPage({ params }: QrDetailPageProps) {
  const { id } = await params;
  const session = (await auth()) as AppSession;

  const qr = await prisma.qrCode.findUnique({
    where: { id },
    include: {
      client: true,
      campaign: true,
      scans: {
        orderBy: { scannedAt: "desc" },
        take: 25,
      },
    },
  });

  if (!qr) {
    notFound();
  }

  if (!canAccessClient(session, qr.clientId)) {
    redirect("/dashboard/qrs");
  }

  const [publicUrl, scanStats, scansByDay] = await Promise.all([
    getQrPublicUrlForRequest(qr.slug),
    getQrScanStats(qr.id),
    getQrScansByDay(qr.id, 30),
  ]);

  return (
    <div>
      <PageHeader
        title={qr.name}
        description={`Cliente: ${qr.client.name}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/qrs/${qr.id}/edit`}>Cambiar destino</Link>
            </Button>
            <CopyLinkButton url={publicUrl} />
            <DeleteConfirmButton
              action={deleteQrCode.bind(null, qr.id)}
              title="Eliminar QR"
              description={`¿Eliminar "${qr.name}"? Se borrarán también todos sus escaneos y el enlace /r/${qr.slug} dejará de funcionar.`}
              triggerLabel="Eliminar"
              variant="outline"
            />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total de escaneos" value={scanStats.total} />
        <StatCard title="Escaneos (7 días)" value={scanStats.last7Days} />
        <StatCard title="Escaneos (30 días)" value={scanStats.last30Days} />
        <StatCard title="Estado" value={QR_STATUS_LABELS[qr.status]} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle>Enlace y destino</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">URL corta</p>
              <p className="mt-1 break-all font-medium">{publicUrl}</p>
              <p className="text-xs text-muted-foreground">
                Ruta interna: {getQrShortPath(qr.slug)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Destino actual</p>
              <a
                href={qr.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all font-medium underline-offset-4 hover:underline"
              >
                {qr.destinationUrl}
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={qr.status} />
              <TypeBadge type={qr.type} />
            </div>
            {qr.campaign ? (
              <p className="text-sm text-muted-foreground">
                Campaña: {qr.campaign.name}
              </p>
            ) : null}
            {qr.notes ? (
              <p className="text-sm text-muted-foreground">{qr.notes}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle>Vista previa del QR</CardTitle>
          </CardHeader>
          <CardContent>
            <QrPreview
              url={publicUrl}
              fileName={qr.slug}
              primaryColor={qr.primaryColor}
              logoUrl={qr.logoUrl ?? qr.client.logoUrl}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60 shadow-none">
        <CardHeader>
          <CardTitle>Escaneos por día</CardTitle>
        </CardHeader>
        <CardContent>
          <QrScansChart data={scansByDay} />
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/60 shadow-none">
        <CardHeader>
          <CardTitle>Últimos escaneos</CardTitle>
        </CardHeader>
        <CardContent>
          {qr.scans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay escaneos registrados. Compartí la URL corta para empezar a medir.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha / hora</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Referer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qr.scans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(scan.scannedAt, "dd MMM yyyy HH:mm", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        {DEVICE_TYPE_LABELS[scan.deviceType]}
                      </TableCell>
                      <TableCell>{scan.browser ?? "—"}</TableCell>
                      <TableCell>{scan.os ?? "—"}</TableCell>
                      <TableCell>
                        {formatLocation(scan.country, scan.city)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {scan.referer ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
