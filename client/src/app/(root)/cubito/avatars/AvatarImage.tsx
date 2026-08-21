"use client";

import { useMemo } from "react";
import { blobatarUri } from "blobatar/uri";

interface AvatarImageProps {
  /** Semilla determinística: el mismo valor genera siempre la misma imagen. */
  seed: string;
  size?: number;
  alt?: string;
  className?: string;
}

/**
 * Imagen de un avatar generada con Blobatar.
 *
 * No se guarda ningún archivo: el SVG se deriva del seed (el _id del avatar),
 * así que es único por avatar y estable entre sesiones y dispositivos.
 */
export default function AvatarImage({
  seed,
  size = 48,
  alt = "",
  className,
}: AvatarImageProps) {
  const src = useMemo(
    () => blobatarUri(seed, { size, background: "circle" }),
    [seed, size]
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
