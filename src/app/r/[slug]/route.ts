import { NextRequest, NextResponse } from "next/server";

import { isQrRedirectAvailable } from "@/lib/qr-redirect";
import { prisma } from "@/lib/prisma";
import { recordScan } from "@/lib/scan";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
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
  } catch (error) {
    console.error("[GET /r/[slug]] Redirect failed:", error);
    return NextResponse.json(
      { error: "No se pudo procesar el enlace." },
      { status: 500 },
    );
  }
}
