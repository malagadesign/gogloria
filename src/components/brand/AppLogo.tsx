import Image from "next/image";

import {
  LOGO_ALT,
  LOGO_PATHS,
  logoHeightForWidth,
} from "@/lib/brand";

type LogoVariant = keyof typeof LOGO_PATHS;

type AppLogoProps = {
  variant?: LogoVariant;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function AppLogo({
  variant = "dark",
  className,
  width = 192,
  height,
  priority = false,
}: AppLogoProps) {
  const src = LOGO_PATHS[variant];
  const h = height ?? logoHeightForWidth(width);

  return (
    <Image
      src={src}
      alt={LOGO_ALT}
      width={width}
      height={h}
      className={className}
      priority={priority}
    />
  );
}
