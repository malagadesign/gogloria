"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  KeyRound,
  LayoutDashboard,
  QrCode,
  LogOut,
  UserCog,
} from "lucide-react";

import { AgencyLogo } from "@/components/brand/AgencyLogo";
import { AppLogo } from "@/components/brand/AppLogo";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { BRAND_TAGLINE, DEVELOPER_CREDIT } from "@/lib/brand";
import { ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
  {
    href: "/dashboard/clients",
    label: "Clientes",
    icon: Building2,
    adminOnly: true,
  },
  {
    href: "/dashboard/users",
    label: "Usuarios",
    icon: UserCog,
    adminOnly: true,
  },
  { href: "/dashboard/qrs", label: "QRs", icon: QrCode },
  { href: "/dashboard/account", label: "Mi cuenta", icon: KeyRound },
];

type DashboardSidebarProps = {
  userName?: string | null;
  userEmail?: string | null;
  role: "ADMIN" | "CLIENT";
};

export function DashboardSidebar({
  userName,
  userEmail,
  role,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "ADMIN",
  );

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 pb-3 pt-4">
        <Link href="/dashboard" className="block transition-opacity hover:opacity-80">
          <AppLogo
            variant="dark"
            width={88}
            className="mx-auto block h-auto max-w-[64%]"
            priority
          />
          <p className="mt-1.5 text-center text-[11px] text-gray-500">{BRAND_TAGLINE}</p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-gray-200">
        <div className="px-4 py-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-gray-900">
              {userName ?? "Usuario"}
            </p>
            <p className="truncate text-xs text-gray-500">{userEmail}</p>
            <p className="mt-1 text-xs text-gray-400">{ROLE_LABELS[role]}</p>
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-2 px-2 text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-gray-200 px-4 py-5">
          <AgencyLogo width={52} className="h-auto opacity-75" />
          <a
            href="mailto:im@malaga-design.com"
            className="text-center text-[10px] leading-snug text-gray-400 transition-colors hover:text-blue-600"
          >
            {DEVELOPER_CREDIT}
          </a>
        </div>
      </div>
    </aside>
  );
}
