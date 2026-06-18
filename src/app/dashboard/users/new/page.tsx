import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserForm } from "@/components/users/user-form";
import { createUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type NewUserPageProps = {
  searchParams: Promise<{ clientId?: string }>;
};

export default async function NewUserPage({ searchParams }: NewUserPageProps) {
  const session = (await auth()) as AppSession;

  if (!isAdmin(session)) {
    redirect("/dashboard");
  }

  const { clientId } = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Nuevo usuario"
        description="Definí la contraseña inicial que le compartirás al usuario."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/users">Volver</Link>
          </Button>
        }
      />

      <Card className="max-w-3xl border-border/60 shadow-none">
        <CardHeader>
          <CardTitle>Datos del usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            action={createUser}
            clients={clients}
            defaultClientId={clientId}
            mode="create"
            submitLabel="Crear usuario"
          />
        </CardContent>
      </Card>
    </div>
  );
}
