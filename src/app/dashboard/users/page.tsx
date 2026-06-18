import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS } from "@/lib/labels";
import { isAdmin, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const session = (await auth()) as AppSession;

  if (!isAdmin(session)) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: { client: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Creá cuentas de acceso para el equipo de agencia o clientes."
        actions={
          <Button asChild>
            <Link href="/dashboard/users/new">Nuevo usuario</Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name ?? "—"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                <TableCell>{user.client?.name ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dashboard/users/${user.id}/edit`}
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    Editar
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
