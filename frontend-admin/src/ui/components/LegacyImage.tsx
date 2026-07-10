import { useEffect, useMemo, useState } from "react";
import { resolveLegacyAssetUrls } from "../../lib/legacyAssets";

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
  const candidates = useMemo(() => resolveLegacyAssetUrls(legacyPath, folder), [legacyPath, folder]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setExhausted(false);
  }, [legacyPath, folder, candidates]);

  const resolvedUrl = candidates[activeIndex] ?? null;

  if (!resolvedUrl || exhausted) {
    return <div className={fallbackClassName}>{fallbackText}</div>;
  }

  return (
    <img
      className={className}
      src={resolvedUrl}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (activeIndex + 1 < candidates.length) {
          setActiveIndex((current) => current + 1);
        } else {
          setExhausted(true);
        }
      }}
    />
  );
}
