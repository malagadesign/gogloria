import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { updateClient, deleteClient } from "@/lib/actions/clients";
import { ClientForm } from "@/components/clients/client-form";
import { DeleteConfirmButton } from "@/components/dashboard/delete-confirm-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type EditClientPageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { clientId } = await params;
  const session = (await auth()) as AppSession;

  if (!isAdmin(session)) {
    redirect("/dashboard");
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    notFound();
  }

  const updateClientAction = updateClient.bind(null, clientId);

  return (
    <div>
      <PageHeader
        title={`Editar ${client.name}`}
        description="Actualizá los datos del cliente."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/clients/${client.id}`}>Volver</Link>
            </Button>
            <DeleteConfirmButton
              action={deleteClient.bind(null, client.id)}
              title="Eliminar cliente"
              description={`¿Eliminar "${client.name}"? Se borrarán sus campañas, QRs y escaneos asociados.`}
            />
          </div>
        }
      />

      <Card className="max-w-3xl border-border/60 shadow-none">
        <CardHeader>
          <CardTitle>Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm
            action={updateClientAction}
            defaultValues={{
              name: client.name,
              slug: client.slug,
              logoUrl: client.logoUrl,
            }}
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
    </div>
  );
}
