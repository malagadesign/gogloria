import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { updateQrCode } from "@/lib/actions/qrs";
import { PageHeader } from "@/components/dashboard/page-header";
import { QrForm } from "@/components/qrs/qr-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canAccessClient, getClientFilter, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type EditQrPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditQrPage({ params }: EditQrPageProps) {
  const { id } = await params;
  const session = (await auth()) as AppSession;
  const clientFilter = getClientFilter(session);

  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) {
    notFound();
  }

  if (!canAccessClient(session, qr.clientId)) {
    redirect("/dashboard/qrs");
  }

  const [clients, campaigns] = await Promise.all([
    prisma.client.findMany({
      where: clientFilter,
      orderBy: { name: "asc" },
    }),
    prisma.campaign.findMany({
      where: { client: clientFilter },
      orderBy: { name: "asc" },
    }),
  ]);

  const updateAction = updateQrCode.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Editar ${qr.name}`}
        description="Cambiá el destino sin modificar el QR impreso."
        actions={
          <Button asChild variant="outline">
            <Link href={`/dashboard/qrs/${qr.id}`}>Volver</Link>
          </Button>
        }
      />

      <Card className="max-w-4xl border-border/60 shadow-none">
        <CardHeader>
          <CardTitle>Configuración del QR</CardTitle>
        </CardHeader>
        <CardContent>
          <QrForm
            action={updateAction}
            clients={clients}
            campaigns={campaigns}
            lockedClientId={
              session.user.role === "CLIENT" ? qr.clientId : undefined
            }
            defaultValues={{
              clientId: qr.clientId,
              campaignId: qr.campaignId,
              name: qr.name,
              slug: qr.slug,
              destinationUrl: qr.destinationUrl,
              type: qr.type,
              status: qr.status,
              expiresAt: qr.expiresAt
                ? qr.expiresAt.toISOString().slice(0, 16)
                : "",
              primaryColor: qr.primaryColor,
              logoUrl: qr.logoUrl,
              notes: qr.notes,
            }}
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
    </div>
  );
}
