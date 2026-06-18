import { z } from "zod";

const urlSchema = z
  .string()
  .trim()
  .url("Ingresá una URL válida (https://...)")
  .refine(
    (value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Solo se permiten URLs http o https" },
  );

export const clientSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: z
    .string()
    .trim()
    .min(2, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  logoUrl: z
    .string()
    .trim()
    .url("URL de logo inválida")
    .optional()
    .or(z.literal("")),
});

export const campaignSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().trim().optional().or(z.literal("")),
});

export const qrCodeSchema = z.object({
  clientId: z.string().min(1, "Seleccioná un cliente"),
  campaignId: z.string().optional().or(z.literal("")),
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: z
    .string()
    .trim()
    .min(2, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  destinationUrl: urlSchema,
  type: z.enum([
    "WEBSITE",
    "WHATSAPP",
    "MENU",
    "REVIEWS",
    "PDF",
    "FORM",
    "PROPERTY",
    "EVENT",
    "OTHER",
  ]),
  status: z.enum(["ACTIVE", "PAUSED", "EXPIRED"]),
  expiresAt: z.string().optional().or(z.literal("")),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido (#RRGGBB)")
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .trim()
    .url("URL de logo inválida")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    throw new Error("Protocolo no permitido");
  }

  const parsed = new URL(trimmed);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Protocolo no permitido");
  }
  return parsed.toString();
}

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

export const userSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre es obligatorio"),
    email: z.string().trim().email("Email inválido"),
    role: z.enum(["ADMIN", "CLIENT"]),
    clientId: z.string().optional().or(z.literal("")),
    password: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.role === "CLIENT" && !data.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccioná un cliente para usuarios con rol Cliente.",
        path: ["clientId"],
      });
    }

    if (data.role === "ADMIN" && data.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Los administradores no deben tener cliente asignado.",
        path: ["clientId"],
      });
    }
  });

export const createUserSchema = userSchema.superRefine((data, ctx) => {
  if (!data.password || data.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña inicial debe tener al menos 8 caracteres.",
      path: ["password"],
    });
  }
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmá la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
