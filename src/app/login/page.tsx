"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { AgencyLogo } from "@/components/brand/AgencyLogo";
import { AppLogo } from "@/components/brand/AppLogo";
import { loginAction } from "@/lib/actions/auth";
import { DEVELOPER_CREDIT, PRODUCT_NAME } from "@/lib/brand";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 animate-gradient-shift bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -right-40 -top-40 h-80 w-80 rounded-full bg-purple-300 opacity-30 mix-blend-multiply blur-xl filter" />
        <div className="animate-blob animation-delay-2000 absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-300 opacity-30 mix-blend-multiply blur-xl filter" />
        <div className="animate-blob animation-delay-4000 absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300 opacity-30 mix-blend-multiply blur-xl filter" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <AppLogo variant="dark" width={120} className="h-auto max-w-[55%]" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              {PRODUCT_NAME}
            </h1>
            <p className="text-gray-600">
              Iniciá sesión para administrar QRs dinámicos
            </p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            {error ? (
              <div className="animate-fade-in flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={pending}
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={pending}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 shadow-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            ¿Problemas para ingresar?{" "}
            <a
              href="mailto:micaela.fontan@agenciagloria.com"
              className="text-cyan-600 underline-offset-4 hover:text-cyan-700 hover:underline"
            >
              Contactá al administrador
            </a>
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <AgencyLogo
            width={52}
            className="h-auto brightness-0 invert opacity-80"
          />
          <p className="text-[10px] text-white/70">{DEVELOPER_CREDIT}</p>
        </div>
      </div>
    </div>
  );
}
