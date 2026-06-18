import Image from "next/image";

import {
  AGENCY_LOGO_ALT,
  AGENCY_LOGO_PATH,
  agencyLogoHeightForWidth,
} from "@/lib/brand";

type AgencyLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function AgencyLogo({
  className,
  width = 64,
  height,
  priority = false,
}: AgencyLogoProps) {
  const h = height ?? agencyLogoHeightForWidth(width);

  return (
    <Image
      src={AGENCY_LOGO_PATH}
      alt={AGENCY_LOGO_ALT}
      width={width}
      height={h}
      className={className}
      priority={priority}
    />
  );
}
