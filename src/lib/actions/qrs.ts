"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma, QrCodeStatus, QrCodeType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  canAccessClient,
  getClientFilter,
  type AppSession,
} from "@/lib/permissions";
import { qrCodeSchema, sanitizeUrl } from "@/lib/validators";
import { toSlug } from "@/lib/slug";

async function requireSession(): Promise<AppSession> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session as AppSession;
}

function parseQrForm(formData: FormData) {
  return qrCodeSchema.safeParse({
    clientId: formData.get("clientId"),
    campaignId: formData.get("campaignId"),
    name: String(formData.get("name") ?? "").trim(),
    slug: toSlug(String(formData.get("slug") ?? "")),
    destinationUrl: formData.get("destinationUrl"),
    type: formData.get("type"),
    status: formData.get("status"),
    expiresAt: formData.get("expiresAt"),
    primaryColor: formData.get("primaryColor"),
    logoUrl: formData.get("logoUrl"),
    notes: formData.get("notes"),
  });
}

async function validateCampaign(
  clientId: string,
  campaignId: string | undefined,
) {
  if (!campaignId) return null;
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, clientId },
  });
  if (!campaign) {
    throw new Error("La campaña no pertenece al cliente seleccionado.");
  }
  return campaignId;
}

export async function createQrCode(formData: FormData) {
  const session = await requireSession();
  const parsed = parseQrForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (!canAccessClient(session, parsed.data.clientId)) {
    return { error: "No tenés permisos para este cliente." };
  }

  const slugTaken = await prisma.qrCode.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugTaken) {
    return { error: "Ya existe un QR con ese slug." };
  }

  let qrId: string;

  try {
    const destinationUrl = sanitizeUrl(parsed.data.destinationUrl);
    const campaignId = await validateCampaign(
      parsed.data.clientId,
      parsed.data.campaignId || undefined,
    );

    const qr = await prisma.qrCode.create({
      data: {
        clientId: parsed.data.clientId,
        campaignId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        destinationUrl,
        type: parsed.data.type as QrCodeType,
        status: parsed.data.status as QrCodeStatus,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
        primaryColor: parsed.data.primaryColor || null,
        logoUrl: parsed.data.logoUrl || null,
        notes: parsed.data.notes || null,
      },
    });

    qrId = qr.id;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo crear el QR.",
    };
  }

  revalidatePath("/dashboard/qrs");
  revalidatePath("/dashboard");
  redirect(`/dashboard/qrs/${qrId}`);
}

export async function updateQrCode(qrId: string, formData: FormData) {
  const session = await requireSession();
  const parsed = parseQrForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const existing = await prisma.qrCode.findUnique({
    where: { id: qrId },
  });
  if (!existing) {
    return { error: "QR no encontrado." };
  }

  if (!canAccessClient(session, existing.clientId)) {
    return { error: "No tenés permisos para editar este QR." };
  }

  const slugTaken = await prisma.qrCode.findFirst({
    where: {
      slug: parsed.data.slug,
      NOT: { id: qrId },
    },
  });
  if (slugTaken) {
    return { error: "Ya existe un QR con ese slug." };
  }

  try {
    const destinationUrl = sanitizeUrl(parsed.data.destinationUrl);
    const campaignId = await validateCampaign(
      parsed.data.clientId,
      parsed.data.campaignId || undefined,
    );

    await prisma.qrCode.update({
      where: { id: qrId },
      data: {
        campaignId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        destinationUrl,
        type: parsed.data.type as QrCodeType,
        status: parsed.data.status as QrCodeStatus,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
        primaryColor: parsed.data.primaryColor || null,
        logoUrl: parsed.data.logoUrl || null,
        notes: parsed.data.notes || null,
      },
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo actualizar el QR.",
    };
  }

  revalidatePath("/dashboard/qrs");
  revalidatePath(`/dashboard/qrs/${qrId}`);
  revalidatePath(`/dashboard/clients/${existing.clientId}`);
  redirect(`/dashboard/qrs/${qrId}`);
}

export type QrListFilters = {
  clientId?: string;
  campaignId?: string;
  status?: QrCodeStatus;
  type?: QrCodeType;
};

export async function getQrListWhere(
  session: AppSession,
  filters: QrListFilters = {},
): Promise<Prisma.QrCodeWhereInput> {
  const where: Prisma.QrCodeWhereInput = {
    client: getClientFilter(session),
  };

  if (filters.clientId && session.user.role === "ADMIN") {
    where.clientId = filters.clientId;
  }

  if (filters.campaignId) {
    where.campaignId = filters.campaignId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  return where;
}

export async function deleteQrCode(qrId: string) {
  const session = await requireSession();

  const qr = await prisma.qrCode.findUnique({
    where: { id: qrId },
    select: { id: true, clientId: true, name: true },
  });

  if (!qr) {
    return { error: "QR no encontrado." };
  }

  if (!canAccessClient(session, qr.clientId)) {
    return { error: "No tenés permisos para eliminar este QR." };
  }

  try {
    await prisma.qrCode.delete({ where: { id: qrId } });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo eliminar el QR.",
    };
  }

  revalidatePath("/dashboard/qrs");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/clients/${qr.clientId}`);
  redirect("/dashboard/qrs");
}
