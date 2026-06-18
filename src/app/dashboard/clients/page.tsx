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
import { isAdmin, type AppSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function ClientsPage() {
  const session = (await auth()) as AppSession;

  if (!isAdmin(session)) {
    if (session.user.clientId) {
      redirect(`/dashboard/clients/${session.user.clientId}`);
    }
    redirect("/dashboard");
  }

  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: { qrCodes: true, campaigns: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Organizá QRs y campañas por cliente de agencia."
        actions={
          <Button asChild>
            <Link href="/dashboard/clients/new">Nuevo cliente</Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Campañas</TableHead>
              <TableHead>QRs</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.slug}</TableCell>
                <TableCell>{client._count.campaigns}</TableCell>
                <TableCell>{client._count.qrCodes}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
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
    </div>
  );
}
