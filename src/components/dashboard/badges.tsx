import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { QR_STATUS_LABELS, QR_TYPE_LABELS } from "@/lib/labels";
import type { QrCodeStatus, QrCodeType } from "@prisma/client";

export function StatusBadge({ status }: { status: QrCodeStatus }) {
  const variant =
    status === "ACTIVE"
      ? "default"
      : status === "PAUSED"
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{QR_STATUS_LABELS[status]}</Badge>;
}

export function TypeBadge({ type }: { type: QrCodeType }) {
  return <Badge variant="outline">{QR_TYPE_LABELS[type]}</Badge>;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
