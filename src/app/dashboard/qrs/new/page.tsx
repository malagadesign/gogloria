import Link from "next/link";

import { auth } from "@/auth";
import { createQrCode } from "@/lib/actions/qrs";
import { PageHeader } from "@/components/dashboard/page-header";
import { QrForm } from "@/components/qrs/qr-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientFilter, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type NewQrPageProps = {
  searchParams: Promise<{ clientId?: string }>;
};

export default async function NewQrPage({ searchParams }: NewQrPageProps) {
  const session = (await auth()) as AppSession;
  const { clientId: presetClientId } = await searchParams;
  const clientFilter = getClientFilter(session);

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

  const lockedClientId =
    session.user.role === "CLIENT"
      ? session.user.clientId ?? undefined
      : presetClientId;

  return (
    <div>
      <PageHeader
        title="Nuevo QR"
        description="Creá un enlace corto editable. El QR impreso apuntará siempre a esta URL."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/qrs">Volver</Link>
          </Button>
        }
      />

      <Card className="max-w-4xl border-border/60 shadow-none">
        <CardHeader>
          <CardTitle>Configuración del QR</CardTitle>
        </CardHeader>
        <CardContent>
          <QrForm
            action={createQrCode}
            clients={clients}
            campaigns={campaigns}
            lockedClientId={lockedClientId}
            defaultValues={{
              clientId: lockedClientId ?? clients[0]?.id,
            }}
            submitLabel="Crear QR"
          />
        </CardContent>
      </Card>
    </div>
  );
}
