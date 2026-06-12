import { useState } from "react";
import { resolveLegacyAssetUrl } from "../../lib/legacyAssets";

type LegacyImageProps = {
  legacyPath?: string | null;
  folder?: string;
  alt: string;
  className: string;
  fallbackClassName: string;
  fallbackText: string;
};

export function LegacyImage({
  legacyPath,
  folder = "images",
  alt,
  className,
  fallbackClassName,
  fallbackText
}: LegacyImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedUrl = resolveLegacyAssetUrl(legacyPath, folder);

  if (!resolvedUrl || failed) {
    return <div className={fallbackClassName}>{fallbackText}</div>;
  }

  return (
    <img
      className={className}
      src={resolvedUrl}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
