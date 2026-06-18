import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LOGO_PATHS, PRODUCT_NAME } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT_NAME} | Agencia Gloria`,
    template: `%s | ${PRODUCT_NAME}`,
  },
  description:
    "Plataforma para generar, administrar y medir QRs dinámicos para clientes de agencia.",
  icons: {
    icon: LOGO_PATHS.dark,
    apple: LOGO_PATHS.dark,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
