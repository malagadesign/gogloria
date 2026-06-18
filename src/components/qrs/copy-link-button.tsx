"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  return (
    <Button type="button" onClick={copy}>
      Copiar enlace
    </Button>
  );
}
