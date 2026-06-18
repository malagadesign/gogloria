import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QR_TYPE_LABELS } from "@/lib/labels";
import type { QrListSearchParams } from "@/lib/qr-filters";
import { countActiveFilters } from "@/lib/qr-filters";
import type { Campaign, Client } from "@prisma/client";

type QrFiltersFormProps = {
  filters: QrListSearchParams;
  clients: Client[];
  campaigns: Campaign[];
  isAdmin: boolean;
  resultCount: number;
};

export function QrFiltersForm({
  filters,
  clients,
  campaigns,
  isAdmin,
  resultCount,
}: QrFiltersFormProps) {
  const activeCount = countActiveFilters(filters);
  const filteredCampaigns = filters.clientId
    ? campaigns.filter((c) => c.clientId === filters.clientId)
    : campaigns;

  return (
    <form
      method="get"
      className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Filtros</p>
          <p className="text-xs text-muted-foreground">
            {resultCount} QR{resultCount === 1 ? "" : "s"} encontrados
            {activeCount > 0 ? ` · ${activeCount} filtro${activeCount === 1 ? "" : "s"} activo${activeCount === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        {activeCount > 0 ? (
          <Button asChild variant="ghost" size="sm" className="gap-1 self-start">
            <Link href="/dashboard/qrs">
              <X className="h-4 w-4" />
              Limpiar filtros
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <Input
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Buscar por nombre, slug o destino..."
          />
        </div>

        {isAdmin ? (
          <select
            name="clientId"
            defaultValue={filters.clientId ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todos los clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        ) : null}

        <select
          name="campaignId"
          defaultValue={filters.campaignId ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas las campañas</option>
          {filteredCampaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="PAUSED">Pausado</option>
          <option value="EXPIRED">Expirado</option>
        </select>

        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(QR_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          name="scans"
          defaultValue={filters.scans ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los escaneos</option>
          <option value="with">Con escaneos</option>
          <option value="without">Sin escaneos</option>
        </select>

        <select
          name="sort"
          defaultValue={filters.sort ?? "updated"}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="updated">Más recientes</option>
          <option value="created">Fecha de creación</option>
          <option value="name">Nombre A → Z</option>
          <option value="scans">Más escaneados</option>
          <option value="scans-asc">Menos escaneados</option>
        </select>
      </div>

      <Button type="submit" variant="secondary">
        Aplicar filtros
      </Button>
    </form>
  );
}
