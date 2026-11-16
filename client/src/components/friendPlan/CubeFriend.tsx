"use client";

import { motion } from "framer-motion";
import { useId } from "react";

/** Colores de cada amigo. El primero es Cubito (el mismo naranja del header). */
export const CUBE_PALETTES = [
  { top: "#F6A054", left: "#EA8C3E", right: "#E67E2C", stroke: "#C4601A" },
  { top: "#F7708F", left: "#EF2D56", right: "#D81F47", stroke: "#B5173A" },
  { top: "#B4EA98", left: "#8CD867", right: "#74C24F", stroke: "#5AA437" },
  { top: "#C3AEF5", left: "#9B7BE8", right: "#8463D9", stroke: "#6A4AC0" },
  { top: "#FFDF85", left: "#FFC93C", right: "#F2B51F", stroke: "#CC9510" },
  { top: "#8FD3F5", left: "#4FB6E8", right: "#2E9ED6", stroke: "#1D7DB0" },
];

/** Aclara (amount > 0) u oscurece (amount < 0) un color hex. */
function shade(hex: string, amount: number): string {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = (value >> shift) & 0xff;
    const target = amount > 0 ? 255 : 0;
    return Math.round(c + (target - c) * Math.abs(amount));
  };
  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, "0")).join("")}`;
}

/*
Un Cubito con cara: el cubo isométrico del header con volumen (luz desde arriba
a la izquierda, sombra suave en el piso, brillo en la tapa y bordes redondeados),
ojos con brillo y cachetes. Parpadea cada tanto; con `happy` sonríe con los ojos
cerrados (cuando festejan).
*/
export default function CubeFriend({
  palette = 0,
  happy = false,
  blinkDelay = 0,
}: {
  palette?: number;
  happy?: boolean;
  blinkDelay?: number;
}) {
  const colors = CUBE_PALETTES[palette % CUBE_PALETTES.length];
  // Ids únicos por cubito: hay varios en la misma página.
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `cube-${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={id("floor")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.28" />
          <stop offset="70%" stopColor="#000" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("top")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={shade(colors.top, 0.35)} />
          <stop offset="100%" stopColor={colors.top} />
        </linearGradient>
        <linearGradient id={id("left")} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={shade(colors.left, 0.12)} />
          <stop offset="100%" stopColor={shade(colors.left, -0.12)} />
        </linearGradient>
        <linearGradient id={id("right")} x1="1" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor={shade(colors.right, -0.05)} />
          <stop offset="100%" stopColor={shade(colors.right, -0.28)} />
        </linearGradient>
        <radialGradient id={id("shine")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("cheek")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B81" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF6B81" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sombra en el piso */}
      <ellipse cx="30" cy="50" rx="19" ry="4.2" fill={url("floor")} />

      {/* Caras del cubo, con bordes redondeados */}
      <polygon
        points="30,5 50,15 30,25 10,15"
        fill={url("top")}
        stroke={shade(colors.stroke, 0.1)}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <polygon
        points="10,15 30,25 30,45 10,35"
        fill={url("left")}
        stroke={colors.stroke}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <polygon
        points="50,15 30,25 30,45 50,35"
        fill={url("right")}
        stroke={shade(colors.stroke, -0.15)}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* Luz: brillo en la tapa y filo iluminado en los bordes de adelante */}
      <ellipse cx="27" cy="12.5" rx="9" ry="3.6" fill={url("shine")} transform="rotate(-8 27 12.5)" />
      <polyline
        points="10.8,15.4 30,25 49.2,15.4"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="30" y1="25.6" x2="30" y2="44.2" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.7" />

      {/* Cara en la cara frontal izquierda, inclinada como el cubo */}
      <g transform="matrix(1 0.5 0 1 0 0)">
        {happy ? (
          <>
            <path d="M13.6 21 q2.4 -3.2 4.8 0" stroke="#3B2314" strokeWidth="1.9" fill="none" strokeLinecap="round" />
            <path d="M21.6 21 q2.4 -3.2 4.8 0" stroke="#3B2314" strokeWidth="1.9" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{
              duration: 3.6,
              times: [0, 0.9, 0.93, 0.96, 1],
              repeat: Infinity,
              delay: blinkDelay,
            }}
          >
            <ellipse cx="16" cy="20.5" rx="2" ry="2.5" fill="#2A160B" />
            <ellipse cx="24" cy="20.5" rx="2" ry="2.5" fill="#2A160B" />
            <circle cx="16.7" cy="19.5" r="0.75" fill="#fff" />
            <circle cx="24.7" cy="19.5" r="0.75" fill="#fff" />
            <circle cx="15.4" cy="21.6" r="0.35" fill="#fff" opacity="0.7" />
            <circle cx="23.4" cy="21.6" r="0.35" fill="#fff" opacity="0.7" />
          </motion.g>
        )}
        <ellipse cx="12.6" cy="24.8" rx="2.4" ry="1.5" fill={url("cheek")} />
        <ellipse cx="27.4" cy="24.8" rx="2.4" ry="1.5" fill={url("cheek")} />
        <path
          d={happy ? "M16 24.4 q4 5.2 8 0 z" : "M16.6 24.8 q3.4 3 6.8 0"}
          stroke="#3B2314"
          strokeWidth="1.7"
          strokeLinejoin="round"
          fill={happy ? "#7A2E1C" : "none"}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
