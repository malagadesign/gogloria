"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DeleteConfirmButtonProps = {
  action: () => Promise<{ error?: string } | void>;
  title: string;
  description: string;
  confirmLabel?: string;
  triggerLabel?: string;
  variant?: "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
};

export function DeleteConfirmButton({
  action,
  title,
  description,
  confirmLabel = "Eliminar",
  triggerLabel = "Eliminar",
  variant = "destructive",
  size = "default",
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    const result = await action();

    if (result?.error) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={variant} size={size}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={false}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Eliminando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
