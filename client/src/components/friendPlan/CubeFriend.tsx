"use client";

import { motion } from "framer-motion";

/** Colores de cada amigo. El primero es Cubito (el mismo naranja del header). */
export const CUBE_PALETTES = [
  { top: "#F6A054", left: "#EA8C3E", right: "#E67E2C", stroke: "#C4601A" },
  { top: "#F7708F", left: "#EF2D56", right: "#D81F47", stroke: "#B5173A" },
  { top: "#B4EA98", left: "#8CD867", right: "#74C24F", stroke: "#5AA437" },
  { top: "#C3AEF5", left: "#9B7BE8", right: "#8463D9", stroke: "#6A4AC0" },
  { top: "#FFDF85", left: "#FFC93C", right: "#F2B51F", stroke: "#CC9510" },
  { top: "#8FD3F5", left: "#4FB6E8", right: "#2E9ED6", stroke: "#1D7DB0" },
];

/*
Un Cubito con cara (el cubo isométrico del header + ojos y sonrisa). Parpadea
cada tanto; con `happy` sonríe con los ojos cerrados (cuando festejan).
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
  return (
    <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible" aria-hidden>
      <ellipse cx="30" cy="51" rx="15" ry="3" fill="rgba(0,0,0,0.12)" />
      <polygon
        points="30,5 50,15 30,25 10,15"
        fill={colors.top}
        stroke={colors.stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <polygon
        points="10,15 30,25 30,45 10,35"
        fill={colors.left}
        stroke={colors.stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <polygon
        points="50,15 30,25 30,45 50,35"
        fill={colors.right}
        stroke={colors.stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
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
            <ellipse cx="16" cy="20.5" rx="2" ry="2.5" fill="#3B2314" />
            <ellipse cx="24" cy="20.5" rx="2" ry="2.5" fill="#3B2314" />
            <circle cx="16.7" cy="19.6" r="0.7" fill="#fff" />
            <circle cx="24.7" cy="19.6" r="0.7" fill="#fff" />
          </motion.g>
        )}
        <ellipse cx="12.8" cy="24.8" rx="1.9" ry="1.1" fill="#FF7A8A" opacity="0.6" />
        <ellipse cx="27.2" cy="24.8" rx="1.9" ry="1.1" fill="#FF7A8A" opacity="0.6" />
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
