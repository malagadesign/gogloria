"use client";

import { useState } from "react";
import slugify from "slugify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toSlug } from "@/lib/slug";

type ClientFormProps = {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaultValues?: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
  };
  submitLabel?: string;
};

export function ClientForm({
  action,
  defaultValues,
  submitLabel = "Guardar cliente",
}: ClientFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!defaultValues?.slug);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
      <div className="grid gap-4 md:grid-cols-2">
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
          <Label htmlFor="slug">Slug</Label>
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
          <Label htmlFor="logoUrl">Logo (URL opcional)</Label>
          <Input
            id="logoUrl"
            name="logoUrl"
            type="url"
            defaultValue={defaultValues?.logoUrl ?? ""}
            placeholder="https://..."
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
