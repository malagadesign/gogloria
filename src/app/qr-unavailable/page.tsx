import Link from "next/link";

import { AgencyLogo } from "@/components/brand/AgencyLogo";
import { AppLogo } from "@/components/brand/AppLogo";

export default function QrUnavailablePage() {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50" />

      <div className="relative z-10 w-full max-w-md space-y-8 text-center">
        <AppLogo variant="dark" width={160} className="mx-auto h-auto" />

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            Este enlace no está disponible
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            El QR puede estar pausado, vencido o haber sido reemplazado.
          </p>

          <Link
            href="https://agenciagloria.com"
            className="mt-6 inline-flex text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
          >
            Ir a Agencia Gloria
          </Link>
        </div>

        <AgencyLogo width={48} className="mx-auto h-auto opacity-70" />
      </div>
    </div>
  );
}
