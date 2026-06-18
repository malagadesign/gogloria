import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import type { AppSession } from "@/lib/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const appSession = session as AppSession;

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar
        userName={appSession.user.name}
        userEmail={appSession.user.email}
        role={appSession.user.role}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
