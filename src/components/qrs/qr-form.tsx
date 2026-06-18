"use client";

import { useMemo, useState } from "react";
import slugify from "slugify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QR_STATUS_LABELS, QR_TYPE_LABELS } from "@/lib/labels";
import { toSlug } from "@/lib/slug";
import type { Campaign, Client, QrCodeStatus, QrCodeType } from "@prisma/client";

type QrFormProps = {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  clients: Client[];
  campaigns: Campaign[];
  defaultValues?: {
    clientId?: string;
    campaignId?: string | null;
    name?: string;
    slug?: string;
    destinationUrl?: string;
    type?: QrCodeType;
    status?: QrCodeStatus;
    expiresAt?: string | null;
    primaryColor?: string | null;
    logoUrl?: string | null;
    notes?: string | null;
  };
  lockedClientId?: string;
  submitLabel?: string;
};

export function QrForm({
  action,
  clients,
  campaigns,
  defaultValues,
  lockedClientId,
  submitLabel = "Guardar QR",
}: QrFormProps) {
  const [clientId, setClientId] = useState(
    lockedClientId ?? defaultValues?.clientId ?? clients[0]?.id ?? "",
  );
  const [campaignId, setCampaignId] = useState(defaultValues?.campaignId ?? "");
  const [type, setType] = useState<QrCodeType>(defaultValues?.type ?? "WEBSITE");
  const [status, setStatus] = useState<QrCodeStatus>(
    defaultValues?.status ?? "ACTIVE",
  );
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!defaultValues?.slug);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.clientId === clientId),
    [campaigns, clientId],
  );

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(toSlug(value));
    }
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="campaignId" value={campaignId} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="status" value={status} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Cliente</Label>
          {lockedClientId ? (
            <Input
              value={clients.find((c) => c.id === lockedClientId)?.name ?? ""}
              disabled
            />
          ) : (
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaignId">Campaña (opcional)</Label>
          <Select value={campaignId} onValueChange={setCampaignId}>
            <SelectTrigger id="campaignId">
              <SelectValue placeholder="Sin campaña" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin campaña</SelectItem>
              {filteredCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug del enlace corto</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(slugify(event.target.value, { lower: true, strict: true }));
            }}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="destinationUrl">Destino actual</Label>
          <Input
            id="destinationUrl"
            name="destinationUrl"
            type="url"
            defaultValue={defaultValues?.destinationUrl ?? ""}
            placeholder="https://..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={(value) => setType(value as QrCodeType)}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(QR_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as QrCodeStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(QR_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresAt">Vencimiento (opcional)</Label>
          <Input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            defaultValue={defaultValues?.expiresAt ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryColor">Color (opcional)</Label>
          <Input
            id="primaryColor"
            name="primaryColor"
            defaultValue={defaultValues?.primaryColor ?? ""}
            placeholder="#000000"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="logoUrl">Logo (URL opcional)</Label>
          <Input
            id="logoUrl"
            name="logoUrl"
            type="url"
            defaultValue={defaultValues?.logoUrl ?? ""}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={defaultValues?.notes ?? ""}
            rows={4}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
