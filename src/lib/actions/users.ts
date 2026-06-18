"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, type AppSession } from "@/lib/permissions";
import { createUserSchema, passwordSchema, userSchema } from "@/lib/validators";

async function requireAdmin(): Promise<AppSession> {
  const session = (await auth()) as AppSession | null;
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!isAdmin(session)) {
    redirect("/dashboard");
  }
  return session;
}

function parseUserForm(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    clientId: formData.get("clientId"),
    password: formData.get("password"),
  };
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(parseUserForm(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe un usuario con ese email." };
  }

  if (parsed.data.role === "CLIENT" && parsed.data.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: parsed.data.clientId },
    });
    if (!client) {
      return { error: "Cliente no encontrado." };
    }
  }

  let userId: string;

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password!, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
        role: parsed.data.role as Role,
        clientId:
          parsed.data.role === "CLIENT" ? parsed.data.clientId || null : null,
      },
    });
    userId = user.id;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo crear el usuario.",
    };
  }

  revalidatePath("/dashboard/users");
  redirect(`/dashboard/users/${userId}/edit`);
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await requireAdmin();
  const parsed = userSchema.safeParse(parseUserForm(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return { error: "Usuario no encontrado." };
  }

  const email = parsed.data.email.toLowerCase();
  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (emailTaken) {
    return { error: "Ya existe un usuario con ese email." };
  }

  if (parsed.data.role === "CLIENT" && parsed.data.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: parsed.data.clientId },
    });
    if (!client) {
      return { error: "Cliente no encontrado." };
    }
  }

  if (
    existing.id === session.user.id &&
    parsed.data.role !== "ADMIN"
  ) {
    return { error: "No podés quitarte el rol de administrador." };
  }

  const password = parsed.data.password?.trim();
  if (password) {
    const passwordParsed = passwordSchema.safeParse(password);
    if (!passwordParsed.success) {
      return {
        error:
          passwordParsed.error.issues[0]?.message ?? "Contraseña inválida",
      };
    }
  }

  try {
    const data: {
      name: string;
      email: string;
      role: Role;
      clientId: string | null;
      passwordHash?: string;
    } = {
      name: parsed.data.name,
      email,
      role: parsed.data.role as Role,
      clientId:
        parsed.data.role === "CLIENT" ? parsed.data.clientId || null : null,
    };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    await prisma.user.update({
      where: { id: userId },
      data,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el usuario.",
    };
  }

  revalidatePath("/dashboard/users");
  revalidatePath(`/dashboard/users/${userId}/edit`);
  redirect(`/dashboard/users/${userId}/edit`);
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();

  if (session.user.id === userId) {
    return { error: "No podés eliminar tu propia cuenta." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return { error: "Usuario no encontrado." };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo eliminar el usuario.",
    };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}
