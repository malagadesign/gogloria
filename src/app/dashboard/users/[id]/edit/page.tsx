import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserForm } from "@/components/users/user-form";
import { updateUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type EditUserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const session = (await auth()) as AppSession;

  if (!isAdmin(session)) {
    redirect("/dashboard");
  }

  const [user, clients] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!user) {
    notFound();
  }

  const updateUserAction = updateUser.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Editar ${user.name ?? user.email}`}
        description="Actualizá datos o restablecé la contraseña del usuario."
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
            action={updateUserAction}
            clients={clients}
            defaultValues={{
              name: user.name ?? "",
              email: user.email,
              role: user.role,
              clientId: user.clientId,
            }}
            mode="edit"
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
    </div>
  );
}
