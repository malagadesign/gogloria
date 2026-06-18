import { NextRequest, NextResponse } from "next/server";

import { isQrRedirectAvailable } from "@/lib/qr-redirect";
import { prisma } from "@/lib/prisma";
import { recordScan } from "@/lib/scan";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  const qr = await prisma.qrCode.findUnique({
    where: { slug },
    select: {
      id: true,
      destinationUrl: true,
      status: true,
      expiresAt: true,
    },
  });

  if (!qr || !isQrRedirectAvailable(qr)) {
    const unavailableUrl = new URL("/qr-unavailable", request.url);
    return NextResponse.redirect(unavailableUrl, 307);
  }

  void recordScan(qr.id, request.headers);

  return NextResponse.redirect(qr.destinationUrl, 307);
}
