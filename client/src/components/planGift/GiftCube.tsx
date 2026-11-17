"use client";

import CubeFriend from "@/components/friendPlan/CubeFriend";

/** Dorado de la cinta (el mismo amarillo de los cubitos de Hacete Amigo). */
const RIBBON = {
  fill: "#FFC93C",
  side: "#F2B51F",
  light: "#FFDF85",
  stroke: "#CC9510",
};

/*
Cinta y moño del regalo, en las coordenadas del cubito (viewBox 60×60).
La cinta cruza la tapa de la arista de atrás a la de adelante a la derecha y
baja por la cara derecha, así no tapa la cara de Cubito (que está a la izquierda).
El moño queda en el centro de la tapa.
*/
function Ribbon() {
  const line = { stroke: RIBBON.stroke, strokeLinejoin: "round" as const };
  return (
    <g>
      <polygon points="22.4,8.8 42.4,18.8 37.6,21.2 17.6,11.2" fill={RIBBON.fill} strokeWidth="0.6" {...line} />
      <polygon points="42.4,18.8 42.4,38.8 37.6,41.2 37.6,21.2" fill={RIBBON.side} strokeWidth="0.6" {...line} />

      {/* Puntas del moño */}
      <path d="M29.2 14.6 L25.4 20 L27.9 19.6 L30 15.2 Z" fill={RIBBON.side} strokeWidth="0.5" {...line} />
      <path d="M30.8 14.6 L34.6 20 L32.1 19.6 L30 15.2 Z" fill={RIBBON.side} strokeWidth="0.5" {...line} />

      {/* Lazos */}
      <path d="M30 14 C25 7.5 18.5 8.5 20.5 12.5 C22 15.2 26.5 15 30 14 Z" fill={RIBBON.fill} strokeWidth="0.6" {...line} />
      <path d="M30 14 C35 7.5 41.5 8.5 39.5 12.5 C38 15.2 33.5 15 30 14 Z" fill={RIBBON.fill} strokeWidth="0.6" {...line} />
      <path
        d="M28.6 13.4 C25.6 10 22.4 10.4 22.6 12.2"
        fill="none"
        stroke={RIBBON.stroke}
        strokeOpacity="0.55"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <path
        d="M31.4 13.4 C34.4 10 37.6 10.4 37.4 12.2"
        fill="none"
        stroke={RIBBON.stroke}
        strokeOpacity="0.55"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <ellipse cx="25.2" cy="10.6" rx="1.6" ry="0.7" fill="#fff" opacity="0.55" transform="rotate(-25 25.2 10.6)" />
      <ellipse cx="30" cy="14" rx="2.2" ry="1.7" fill={RIBBON.light} strokeWidth="0.6" {...line} />
    </g>
  );
}

/** Cubito envuelto para regalo: el cubo rosa de la marca con cinta y moño dorados. */
export default function GiftCube({
  happy = false,
  float = true,
}: {
  /** Sonríe con los ojos cerrados (regalo hecho). */
  happy?: boolean;
  float?: boolean;
}) {
  return <CubeFriend palette={1} happy={happy} float={float} accessory={<Ribbon />} />;
}
