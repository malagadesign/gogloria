"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type QrPreviewProps = {
  url: string;
  fileName: string;
  primaryColor?: string | null;
  logoUrl?: string | null;
};

const QR_SIZE = 320;

function sanitizeColor(color?: string | null): string {
  if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color;
  }
  return "#1d1d1b";
}

function buildFileName(name: string, extension: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "qr-gloria"}.${extension}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar el logo"));
    image.src = src;
  });
}

async function composeQrCanvas(
  url: string,
  darkColor: string,
  logoUrl?: string | null,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const hasLogo = !!logoUrl;

  await QRCode.toCanvas(canvas, url, {
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: hasLogo ? "H" : "M",
    color: {
      dark: darkColor,
      light: "#ffffff",
    },
  });

  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;

      const logoSize = QR_SIZE * 0.22;
      const padding = logoSize * 0.15;
      const x = (QR_SIZE - logoSize) / 2;
      const y = (QR_SIZE - logoSize) / 2;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(
        x - padding,
        y - padding,
        logoSize + padding * 2,
        logoSize + padding * 2,
        8,
      );
      ctx.fill();

      ctx.drawImage(logo, x, y, logoSize, logoSize);
    } catch {
      // QR válido sin logo si la imagen falla (CORS, URL rota, etc.)
    }
  }

  return canvas;
}

function injectLogoIntoSvg(svg: string, logoDataUrl: string): string {
  const size = 100;
  const logoSize = 22;
  const offset = (size - logoSize) / 2;
  const padding = 2.6;

  const logoBlock = `
    <rect x="${offset - padding}" y="${offset - padding}" width="${logoSize + padding * 2}" height="${logoSize + padding * 2}" rx="2.5" fill="#ffffff"/>
    <image href="${logoDataUrl}" x="${offset}" y="${offset}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>
  `;

  return svg.replace("</svg>", `${logoBlock}</svg>`);
}

export function QrPreview({ url, fileName, primaryColor, logoUrl }: QrPreviewProps) {
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const darkColor = useMemo(() => sanitizeColor(primaryColor), [primaryColor]);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      setLoading(true);

      try {
        const canvas = await composeQrCanvas(url, darkColor, logoUrl);
        canvasRef.current = canvas;

        const png = canvas.toDataURL("image/png");

        let svg = await QRCode.toString(url, {
          type: "svg",
          margin: 2,
          errorCorrectionLevel: logoUrl ? "H" : "M",
          color: {
            dark: darkColor,
            light: "#ffffff",
          },
        });

        if (logoUrl) {
          try {
            const logoCanvas = document.createElement("canvas");
            logoCanvas.width = 64;
            logoCanvas.height = 64;
            const logo = await loadImage(logoUrl);
            logoCanvas.getContext("2d")?.drawImage(logo, 0, 0, 64, 64);
            svg = injectLogoIntoSvg(svg, logoCanvas.toDataURL("image/png"));
          } catch {
            // SVG sin logo si falla la carga
          }
        }

        if (!cancelled) {
          setPngDataUrl(png);
          setSvgMarkup(svg);
        }
      } catch {
        if (!cancelled) {
          toast.error("No se pudo generar la vista previa del QR");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void generate();

    return () => {
      cancelled = true;
    };
  }, [url, darkColor, logoUrl]);

  function downloadPng() {
    const dataUrl = canvasRef.current?.toDataURL("image/png") ?? pngDataUrl;
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = buildFileName(fileName, "png");
    link.click();
    toast.success("QR descargado en PNG");
  }

  function downloadSvg() {
    if (!svgMarkup) return;

    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = buildFileName(fileName, "svg");
    link.click();
    URL.revokeObjectURL(objectUrl);
    toast.success("QR descargado en SVG");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center rounded-xl border border-border/60 bg-white p-6">
        {loading ? (
          <div className="flex h-[320px] w-[320px] items-center justify-center text-sm text-muted-foreground">
            Generando QR...
          </div>
        ) : pngDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pngDataUrl}
            alt={`QR para ${fileName}`}
            width={QR_SIZE}
            height={QR_SIZE}
            className="h-[320px] w-[320px]"
          />
        ) : (
          <div className="flex h-[320px] w-[320px] items-center justify-center text-sm text-muted-foreground">
            No se pudo generar el QR
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Este QR apunta a la URL corta, no al destino final.
        {logoUrl ? " Incluye logo centrado con corrección alta." : ""}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={downloadPng}
          disabled={!pngDataUrl}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar PNG
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={downloadSvg}
          disabled={!svgMarkup}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar SVG
        </Button>
      </div>
    </div>
  );
}
