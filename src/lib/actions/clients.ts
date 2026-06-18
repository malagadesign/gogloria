"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessClient, isAdmin, type AppSession } from "@/lib/permissions";
import { clientSchema } from "@/lib/validators";

async function requireSession(): Promise<AppSession> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session as AppSession;
}

export async function createClient(formData: FormData) {
  const session = await requireSession();
  if (!isAdmin(session)) {
    return { error: "No tenés permisos para crear clientes." };
  }

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logoUrl: formData.get("logoUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const existing = await prisma.client.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return { error: "Ya existe un cliente con ese slug." };
  }

  await prisma.client.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}

export async function updateClient(clientId: string, formData: FormData) {
  const session = await requireSession();
  if (!isAdmin(session)) {
    return { error: "No tenés permisos para editar clientes." };
  }

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logoUrl: formData.get("logoUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return { error: "Cliente no encontrado." };
  }

  const slugTaken = await prisma.client.findFirst({
    where: {
      slug: parsed.data.slug,
      NOT: { id: clientId },
    },
  });
  if (slugTaken) {
    return { error: "Ya existe un cliente con ese slug." };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}

export async function createCampaign(clientId: string, formData: FormData) {
  const session = await requireSession();
  if (!canAccessClient(session, clientId)) {
    throw new Error("No tenés permisos para este cliente.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (name.length < 2 || slug.length < 2) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  const existing = await prisma.campaign.findUnique({
    where: { clientId_slug: { clientId, slug } },
  });
  if (existing) {
    throw new Error("Ya existe una campaña con ese slug para este cliente.");
  }

  await prisma.campaign.create({
    data: {
      clientId,
      name,
      slug,
      description: description || null,
    },
  });

  revalidatePath(`/dashboard/clients/${clientId}`);
}
