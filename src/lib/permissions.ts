import type { Role } from "@prisma/client";
import type { Session } from "next-auth";

export type AppSession = Session & {
  user: Session["user"] & {
    id: string;
    role: Role;
    clientId: string | null;
  };
};

export function isAdmin(session: AppSession | null): boolean {
  return session?.user.role === "ADMIN";
}

export function canAccessClient(
  session: AppSession | null,
  clientId: string,
): boolean {
  if (!session) return false;
  if (session.user.role === "ADMIN") return true;
  return session.user.clientId === clientId;
}

export function getClientFilter(session: AppSession | null) {
  if (!session) return { id: "__none__" };
  if (session.user.role === "ADMIN") return {};
  if (session.user.clientId) return { id: session.user.clientId };
  return { id: "__none__" };
}
