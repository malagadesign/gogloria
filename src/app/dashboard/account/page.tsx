import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppSession } from "@/lib/permissions";

export default async function AccountPage() {
  const session = (await auth()) as AppSession | null;

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <PageHeader
        title="Mi cuenta"
        description="Actualizá tu contraseña de acceso a QR Studio."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Nombre: </span>
              {session.user.name ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {session.user.email}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
