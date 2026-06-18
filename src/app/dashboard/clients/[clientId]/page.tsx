import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { StatusBadge, TypeBadge } from "@/components/dashboard/badges";
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
import { createCampaign, deleteCampaign } from "@/lib/actions/clients";
import { canAccessClient, isAdmin, type AppSession } from "@/lib/permissions";
import { DeleteConfirmButton } from "@/components/dashboard/delete-confirm-button";
import { prisma } from "@/lib/prisma";
import { getQrShortPath } from "@/lib/qr-url";

type ClientDetailPageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = await params;
  const session = (await auth()) as AppSession;

  if (!canAccessClient(session, clientId)) {
    redirect("/dashboard");
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      campaigns: { orderBy: { name: "asc" } },
      users: { orderBy: { name: "asc" } },
      qrCodes: {
        include: {
          campaign: true,
          _count: { select: { scans: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { qrCodes: true } },
    },
  });

  if (!client) {
    notFound();
  }

  const totalScans = await prisma.qrScan.count({
    where: { qrCode: { clientId } },
  });

  return (
    <div>
      <PageHeader
        title={client.name}
        description={`Slug: ${client.slug}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {isAdmin(session) ? (
              <Button asChild variant="outline">
                <Link href={`/dashboard/clients/${client.id}/edit`}>Editar cliente</Link>
              </Button>
            ) : null}
            <Button asChild>
              <Link href={`/dashboard/qrs/new?clientId=${client.id}`}>Nuevo QR</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="QRs del cliente" value={client._count.qrCodes} />
        <StatCard title="Campañas" value={client.campaigns.length} />
        <StatCard title="Total de escaneos" value={totalScans} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        {isAdmin(session) ? (
          <Card className="border-border/60 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Usuarios del cliente</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/users/new?clientId=${client.id}`}>
                  Nuevo usuario
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.users.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay usuarios asignados a este cliente.
                </p>
              ) : (
                <ul className="space-y-3">
                  {client.users.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{user.name ?? user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/users/${user.id}/edit`}
                        className="text-sm underline-offset-4 hover:underline"
                      >
                        Editar
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle>Campañas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {client.campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay campañas para este cliente.
              </p>
            ) : (
              <ul className="space-y-3">
                {client.campaigns.map((campaign) => (
                  <li
                    key={campaign.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.slug}</p>
                      {campaign.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {campaign.description}
                        </p>
                      ) : null}
                    </div>
                    {isAdmin(session) ? (
                      <DeleteConfirmButton
                        action={deleteCampaign.bind(null, campaign.id, client.id)}
                        title="Eliminar campaña"
                        description={`¿Eliminar "${campaign.name}"? Los QRs asociados quedarán sin campaña.`}
                        triggerLabel="Eliminar"
                        variant="ghost"
                        size="sm"
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            <form action={createCampaign.bind(null, client.id)} className="space-y-3 border-t border-border/60 pt-6">
              <p className="text-sm font-medium">Nueva campaña</p>
              <input
                name="name"
                placeholder="Nombre"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              />
              <input
                name="slug"
                placeholder="slug-campaña"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              />
              <textarea
                name="description"
                placeholder="Descripción opcional"
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button type="submit" variant="secondary">
                Crear campaña
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-none xl:col-span-1">
          <CardHeader>
            <CardTitle>QRs del cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Escaneos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.qrCodes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          href={`/dashboard/qrs/${qr.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {qr.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {getQrShortPath(qr.slug)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={qr.status} />
                        <TypeBadge type={qr.type} />
                      </div>
                    </TableCell>
                    <TableCell>{qr._count.scans}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
