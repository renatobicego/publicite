"use client";

import { Button, Link } from "@nextui-org/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import CubeFriend, { CUBE_PALETTES } from "@/components/friendPlan/CubeFriend";

/** Colores del regalo: el rosa de la marca con cinta dorada (los mismos de GiftCube). */
const BOX = {
  front: "#EF2D56",
  side: "#D81F47",
  light: "#F7708F",
  edge: "#B5173A",
  ribbon: "#FFC93C",
  ribbonSide: "#F2B51F",
  ribbonLight: "#FFDF85",
  ribbonEdge: "#CC9510",
};

/** Cuándo pasa cada cosa (ms desde que se abre). */
const SHAKE_AT = 750;
const OPEN_AT = 1700;

type Phase = "drop" | "shake" | "open";

const noopSubscribe = () => () => {};

/*
Festejo al activar un plan regalado, en toda la pantalla: cae un regalo grande,
se sacude, se abre la tapa y sale Cubito saltando entre papelitos, con el
mensaje "Ya activaste tu plan …". Se cierra con el botón, con Escape o tocando
afuera (una vez abierto). Con "reducir movimiento" del sistema aparece directo
abierto y sin papelitos.
*/
export default function GiftActivatedCelebration({
  open,
  planName,
  until,
  giverName,
  actionHref,
  onClose,
}: {
  open: boolean;
  planName: string;
  /** Fecha de vencimiento ya formateada; null si no se sabe. */
  until: string | null;
  giverName?: string | null;
  /** Si viene, el botón lleva ahí; si no, sólo cierra. */
  actionHref?: string;
  onClose: () => void;
}) {
  // El portal va a document.body: sólo en el navegador (en el server no existe).
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <Celebration
          planName={planName}
          until={until}
          giverName={giverName}
          actionHref={actionHref}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}

function Celebration({
  planName,
  until,
  giverName,
  actionHref,
  onClose,
}: {
  planName: string;
  until: string | null;
  giverName?: string | null;
  actionHref?: string;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "open" : "drop");
  const opened = phase === "open";
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const timers = [
      setTimeout(() => setPhase("shake"), SHAKE_AT),
      setTimeout(() => setPhase("open"), OPEN_AT),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  // Sin scroll de la página mientras está abierto.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (!opened) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const focus = setTimeout(() => buttonRef.current?.focus(), 900);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(focus);
    };
  }, [opened, onClose]);

  const details = [
    giverName ? `Te lo regaló ${giverName}` : null,
    until ? `Vigente hasta el ${until}` : null,
  ].filter(Boolean);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gift-celebration-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      onClick={(event) => {
        if (opened && event.target === event.currentTarget) onClose();
      }}
    >
      {opened && !reduceMotion && <ConfettiBurst />}

      <div className="relative flex flex-col items-center gap-6 pointer-events-none">
        {/* Rayos de luz detrás del regalo al abrirse */}
        <AnimatePresence>
          {opened && (
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-[150px] -ml-[320px] -mt-[320px] size-[640px] rounded-full"
              style={{
                background:
                  "repeating-conic-gradient(rgba(255,223,133,0.55) 0deg 10deg, transparent 10deg 30deg)",
                maskImage: "radial-gradient(circle, black 0%, black 25%, transparent 68%)",
                WebkitMaskImage: "radial-gradient(circle, black 0%, black 25%, transparent 68%)",
              }}
              initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: reduceMotion ? 0 : 360,
              }}
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: 0.6, ease: "easeOut" },
                rotate: { duration: 24, ease: "linear", repeat: Infinity },
              }}
            />
          )}
        </AnimatePresence>

        <GiftBox phase={phase} reduceMotion={!!reduceMotion} />

        <AnimatePresence>
          {opened && (
            <motion.div
              className="relative flex flex-col items-center gap-3 text-center text-white pointer-events-auto max-w-md"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.45, ease: "easeOut" }}
            >
              <h2
                id="gift-celebration-title"
                className="text-3xl md:text-4xl font-bold leading-tight drop-shadow"
              >
                ¡Ya activaste tu plan {planName}!
              </h2>
              {details.length > 0 && (
                <p className="text-base md:text-lg text-white/85">{details.join(" · ")}</p>
              )}
              {actionHref ? (
                <Button
                  ref={buttonRef}
                  as={Link}
                  href={actionHref}
                  color="primary"
                  radius="full"
                  size="lg"
                  className="mt-2 font-semibold"
                  onPress={onClose}
                >
                  Empezar a usarlo
                </Button>
              ) : (
                <Button
                  ref={buttonRef}
                  color="primary"
                  radius="full"
                  size="lg"
                  className="mt-2 font-semibold"
                  onPress={onClose}
                >
                  Empezar a usarlo
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/*
El regalo, en un lienzo de 260×300: el cuerpo abajo, la tapa con moño encima y
Cubito escondido adentro (detrás del frente). Al abrirse la tapa sale volando y
Cubito salta afuera.
*/
function GiftBox({ phase, reduceMotion }: { phase: Phase; reduceMotion: boolean }) {
  const opened = phase === "open";

  return (
    <motion.div
      className="relative w-[260px] h-[300px] scale-[0.8] sm:scale-100 -my-8 sm:my-0"
      initial={reduceMotion ? false : { y: "-70vh", scale: 0.5, opacity: 0 }}
      animate={
        phase === "shake"
          ? { y: 0, scale: 1, opacity: 1, rotate: [0, -5, 5, -6, 6, -4, 4, 0] }
          : { y: 0, scale: 1, opacity: 1, rotate: 0 }
      }
      transition={
        phase === "shake"
          ? { rotate: { duration: 0.8, ease: "easeInOut" } }
          : { type: "spring", stiffness: 170, damping: 14 }
      }
    >
      {/* Borde de atrás de la caja (se ve el interior cuando se va la tapa) */}
      <svg
        viewBox="0 0 240 24"
        className="absolute left-[10px] top-[146px] w-[240px] h-[24px] z-0"
        aria-hidden
      >
        <path d="M6 24 L18 4 Q20 0 26 0 L214 0 Q220 0 222 4 L234 24 Z" fill="#8E1230" />
        <rect x="105" y="4" width="30" height="20" fill={BOX.ribbonEdge} />
      </svg>

      {/* Cubito: arranca adentro de la caja y salta afuera */}
      <motion.div
        className="absolute left-[65px] top-[160px] size-[130px] z-0"
        initial={false}
        animate={opened ? { y: -185, scale: 1.15 } : { y: 0, scale: 0.9 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 11, delay: 0.15 }
        }
      >
        <CubeFriend palette={0} happy={opened} float={opened} />
      </motion.div>

      {/* Cuerpo de la caja */}
      <svg
        viewBox="0 0 240 140"
        className="absolute left-[10px] top-[160px] w-[240px] h-[140px] z-10 drop-shadow-xl"
        aria-hidden
      >
        <rect x="0" y="0" width="240" height="140" rx="12" fill={BOX.front} />
        <rect x="170" y="0" width="70" height="140" rx="12" fill={BOX.side} />
        <rect x="160" y="0" width="20" height="140" fill={BOX.side} />
        <rect x="0" y="0" width="240" height="14" fill={BOX.edge} opacity="0.55" />
        <rect x="105" y="0" width="30" height="140" fill={BOX.ribbon} />
        <rect x="128" y="0" width="7" height="140" fill={BOX.ribbonSide} />
        <rect x="14" y="26" width="8" height="90" rx="4" fill={BOX.light} opacity="0.6" />
      </svg>

      {/* Tapa con moño */}
      <motion.svg
        viewBox="0 0 260 100"
        className="absolute left-0 top-[95px] w-[260px] h-[100px] z-20 origin-bottom-left"
        aria-hidden
        initial={false}
        animate={
          opened
            ? { y: -260, x: 160, rotate: 40, opacity: 0 }
            : { y: 0, x: 0, rotate: 0, opacity: 1 }
        }
        transition={reduceMotion ? { duration: 0 } : { duration: 0.75, ease: [0.3, 0.7, 0.4, 1] }}
      >
        <rect x="0" y="50" width="260" height="46" rx="10" fill={BOX.front} />
        <rect x="185" y="50" width="75" height="46" rx="10" fill={BOX.side} />
        <rect x="175" y="50" width="20" height="46" fill={BOX.side} />
        <rect x="0" y="50" width="260" height="10" rx="5" fill={BOX.light} />
        <rect x="115" y="50" width="30" height="46" fill={BOX.ribbon} />
        <rect x="138" y="50" width="7" height="46" fill={BOX.ribbonSide} />
        {/* Puntas */}
        <path d="M126 52 L106 84 L117 82 L130 56 Z" fill={BOX.ribbonSide} stroke={BOX.ribbonEdge} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M134 52 L154 84 L143 82 L130 56 Z" fill={BOX.ribbonSide} stroke={BOX.ribbonEdge} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Lazos */}
        <path
          d="M130 50 C108 14 72 18 82 40 C88 54 112 54 130 50 Z"
          fill={BOX.ribbon}
          stroke={BOX.ribbonEdge}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M130 50 C152 14 188 18 178 40 C172 54 148 54 130 50 Z"
          fill={BOX.ribbon}
          stroke={BOX.ribbonEdge}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M124 46 C110 30 94 30 92 38" fill="none" stroke={BOX.ribbonEdge} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        <path d="M136 46 C150 30 166 30 168 38" fill="none" stroke={BOX.ribbonEdge} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="130" cy="50" rx="12" ry="10" fill={BOX.ribbonLight} stroke={BOX.ribbonEdge} strokeWidth="2" />
      </motion.svg>
    </motion.div>
  );
}

/** Pseudoaleatorio fijo por índice: los papelitos no cambian entre renders. */
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/*
Papelitos que salen disparados desde el regalo hacia los costados y arriba y
caen hasta abajo de la pantalla, con los colores de los cubitos.
*/
function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, index) => {
        const angle = -Math.PI / 2 + (seeded(index, 1) - 0.5) * Math.PI * 1.4;
        const power = 0.45 + seeded(index, 2) * 0.55;
        return {
          dx: Math.cos(angle) * power * 48,
          dy: Math.sin(angle) * power * 45,
          fall: 70 + seeded(index, 3) * 30,
          spin: (seeded(index, 4) - 0.5) * 1080,
          delay: seeded(index, 5) * 0.25,
          duration: 2.4 + seeded(index, 6) * 1.2,
          color: CUBE_PALETTES[index % CUBE_PALETTES.length][index % 2 ? "left" : "top"],
          round: index % 5 === 0,
          size: 8 + Math.round(seeded(index, 7) * 6),
        };
      }),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {pieces.map((piece, index) => (
        <motion.span
          key={index}
          className={`absolute left-1/2 top-[45%] block ${piece.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 1.4,
            backgroundColor: piece.color,
          }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
          animate={{
            x: [`0vw`, `${piece.dx}vw`, `${piece.dx * 1.15}vw`],
            y: [`0vh`, `${piece.dy}vh`, `${piece.fall}vh`],
            opacity: [1, 1, 1, 0],
            rotate: piece.spin,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            times: [0, 0.28, 1],
            ease: ["easeOut", "easeIn"],
            opacity: { duration: piece.duration, delay: piece.delay, times: [0, 0.3, 0.85, 1] },
          }}
        />
      ))}
    </div>
  );
}
