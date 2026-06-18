"use client";

import { useMemo, useState } from "react";

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
import { ROLE_LABELS } from "@/lib/labels";
import type { Client, Role } from "@prisma/client";

type UserFormProps = {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  clients: Client[];
  defaultValues?: {
    name?: string;
    email?: string;
    role?: Role;
    clientId?: string | null;
  };
  defaultClientId?: string;
  mode?: "create" | "edit";
  submitLabel?: string;
};

export function UserForm({
  action,
  clients,
  defaultValues,
  defaultClientId,
  mode = "create",
  submitLabel,
}: UserFormProps) {
  const [role, setRole] = useState<Role>(
    defaultValues?.role ?? (defaultClientId ? "CLIENT" : "CLIENT"),
  );
  const [clientId, setClientId] = useState(
    defaultValues?.clientId ?? defaultClientId ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => a.name.localeCompare(b.name)),
    [clients],
  );

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
      <input type="hidden" name="role" value={role} />
      <input
        type="hidden"
        name="clientId"
        value={role === "CLIENT" ? clientId : ""}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues?.name ?? ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as Role)}
          >
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente</Label>
          <Select
            value={clientId}
            onValueChange={setClientId}
            disabled={role === "ADMIN"}
          >
            <SelectTrigger id="clientId">
              <SelectValue
                placeholder={
                  role === "ADMIN" ? "No aplica" : "Seleccionar cliente"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {sortedClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {role === "ADMIN" ? (
            <p className="text-xs text-muted-foreground">
              Los administradores ven todos los clientes y QRs.
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="password">
            {mode === "create"
              ? "Contraseña inicial"
              : "Nueva contraseña (opcional)"}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "create" ? "new-password" : "off"}
            required={mode === "create"}
            placeholder={
              mode === "create"
                ? "Mínimo 8 caracteres — compartila con el usuario"
                : "Dejá vacío para mantener la actual"
            }
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Guardando..."
          : (submitLabel ??
            (mode === "create" ? "Crear usuario" : "Guardar cambios"))}
      </Button>
    </form>
  );
}
