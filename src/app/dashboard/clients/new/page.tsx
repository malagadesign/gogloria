import Link from "next/link";

import { createClient } from "@/lib/actions/clients";
import { ClientForm } from "@/components/clients/client-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <div>
      <PageHeader
        title="Nuevo cliente"
        description="Alta de un nuevo cliente de agencia."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/clients">Volver</Link>
          </Button>
        }
      />

      <Card className="max-w-3xl border-border/60 shadow-none">
        <CardHeader>
          <CardTitle>Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm action={createClient} submitLabel="Crear cliente" />
        </CardContent>
      </Card>
    </div>
  );
}
