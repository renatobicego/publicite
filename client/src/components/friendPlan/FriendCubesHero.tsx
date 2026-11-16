"use client";

import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FaCreditCard, FaHeart } from "react-icons/fa6";

import { FriendPlanTier, money } from "@/types/friendGroupTypes";
import CubeFriend, { CUBE_PALETTES } from "./CubeFriend";

const STEP_MS = 1900;
const CELEBRATE_MS = 3400;
const RESUME_AFTER_CLICK_MS = 9000;

/*
Animación de Hacete Amigo: Cubito está solo y paga el plan entero; se van
sumando amigos (otros cubitos) y el precio por persona baja con los tramos
reales del plan elegido. Al completar el grupo festejan y vuelve a empezar.
Los botones de abajo dejan ver cada tramo. Con "reducir movimiento" del sistema
queda quieta en el grupo de 4.
*/
export default function FriendCubesHero({
  planAmount,
  tiers,
  maxMembers,
}: {
  planAmount: number;
  tiers: FriendPlanTier[];
  /** 0 = sin tope (el último tramo vale "o más"). */
  maxMembers: number;
}) {
  const reduceMotion = useReducedMotion();
  const maxCount = Math.max(2, tiers[tiers.length - 1]?.members ?? 5);
  const [step, setStep] = useState(1);
  const [autoplay, setAutoplay] = useState(true);
  // Sin animaciones (y sin que hayan elegido un tramo): el grupo de 4, "pagan 3, rinden 4".
  const count = reduceMotion && autoplay ? Math.min(4, maxCount) : step;
  const celebrating = count === maxCount;

  useEffect(() => {
    if (reduceMotion || !autoplay) return;
    const timer = setTimeout(
      () => setStep((current) => (current >= maxCount ? 1 : current + 1)),
      step >= maxCount ? CELEBRATE_MS : STEP_MS
    );
    return () => clearTimeout(timer);
  }, [step, autoplay, reduceMotion, maxCount]);

  useEffect(() => {
    if (autoplay) return;
    const timer = setTimeout(() => setAutoplay(true), RESUME_AFTER_CLICK_MS);
    return () => clearTimeout(timer);
  }, [autoplay, step]);

  const tier = useMemo(() => {
    if (count < 2) return null;
    return (
      [...tiers].reverse().find((candidate) => candidate.members <= count) ?? tiers[0] ?? null
    );
  }, [count, tiers]);

  const pricePerMember = tier?.pricePerMember ?? planAmount;
  const isLast = count === maxCount && maxMembers === 0;
  const caption = captionFor(count, tier, planAmount, isLast);

  const pick = (value: number) => {
    setAutoplay(false);
    setStep(value);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/10 via-white to-white px-3 sm:px-6 pt-5 pb-4"
        role="img"
        aria-label={`Hacete Amigo: ${caption}`}
      >
        {/* Precio de cada uno */}
        <div className="flex justify-center h-12">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={count}
              initial={{ y: -14, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 14, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="flex items-center gap-2 rounded-full bg-white shadow-md px-4 py-2 h-fit"
            >
              {tier && tier.discountPercent > 0 && (
                <span className="rounded-full bg-primary text-white text-xs font-bold px-2 py-0.5">
                  -{tier.discountPercent} %
                </span>
              )}
              <span className="text-sm">
                <strong className="text-base">{money(pricePerMember)}</strong>{" "}
                {count === 1 ? "por mes" : "cada uno"}
              </span>
              {count > 1 && pricePerMember < planAmount && (
                <span className="text-xs text-default-400 line-through">
                  {money(planAmount)}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Los cubitos */}
        <div className="relative flex justify-center items-end gap-0.5 sm:gap-4 h-28 sm:h-36 mt-2">
          <AnimatePresence>
            {Array.from({ length: count }).map((_, index) => (
              <motion.div
                key={index}
                layout
                initial={
                  index === 0
                    ? { opacity: 0, scale: 0.6 }
                    : { opacity: 0, x: 120, y: -70, rotate: 25 }
                }
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4, y: 24, transition: { duration: 0.25 } }}
                transition={{ type: "spring", stiffness: 240, damping: 16 }}
                className="relative w-14 h-14 sm:w-24 sm:h-24"
              >
                <motion.div
                  className="w-full h-full"
                  animate={
                    celebrating
                      ? { y: [0, -26, 0, -14, 0], rotate: [0, -6, 0, 6, 0] }
                      : { y: [0, -3, 0] }
                  }
                  transition={
                    celebrating
                      ? { duration: 1.1, delay: 0.2 + index * 0.08, repeat: 1, repeatDelay: 0.4 }
                      : { duration: 2.4, delay: index * 0.3, repeat: Infinity, ease: "easeInOut" }
                  }
                >
                  <CubeFriend palette={index} happy={celebrating} blinkDelay={index * 0.7} />
                </motion.div>

                {/* Uno paga por todos: Cubito lleva la tarjeta */}
                {index === 0 && count > 1 && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-white shadow px-1.5 py-0.5 text-[10px] font-semibold text-text-color whitespace-nowrap"
                  >
                    <FaCreditCard className="text-primary" /> paga
                  </motion.span>
                )}

                {/* Saludo del que llega */}
                {index === count - 1 && index > 0 && !celebrating && (
                  <motion.span
                    key={`heart-${count}`}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.3, 1, 1], y: -46 }}
                    transition={{ duration: 1.4, delay: 0.35 }}
                    className="absolute -left-2 top-0 text-primary text-lg"
                  >
                    <FaHeart />
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Festejo */}
          {celebrating && <Confetti />}
        </div>
        <div className="mx-6 h-px bg-default-200" />

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-center text-sm md:text-base font-medium mt-3 min-h-6"
          >
            {caption}
          </motion.p>
        </AnimatePresence>

        {/* Ver cada tramo */}
        <div className="flex justify-center gap-1.5 mt-3" aria-label="Ver precio por cantidad de amigos">
          {Array.from({ length: maxCount }).map((_, index) => {
            const value = index + 1;
            const label =
              value === 1 ? "Solo" : value === maxCount && maxMembers === 0 ? `${value}+` : String(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => pick(value)}
                aria-pressed={count === value}
                className={`min-w-9 h-7 px-2 rounded-full text-xs font-semibold transition-colors ${
                  count === value
                    ? "bg-primary text-white"
                    : "bg-default-100 text-default-600 hover:bg-default-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </MotionConfig>
  );
}

function captionFor(
  count: number,
  tier: FriendPlanTier | null,
  planAmount: number,
  isLast: boolean
): string {
  if (count === 1 || !tier) return `Cubito solo paga ${money(planAmount)} por mes. ¿Y si suma amigos?`;
  const discount = tier.discountPercent;
  if (count === 2) return `Sumó a un amigo y ahorran ${discount} %.`;
  if (count === 4 && discount === 25) return "4x3: pagan 3, rinden 4.";
  if (isLast) return `De a ${count} o más, ${discount} % menos para todos. Uno paga por todos.`;
  return `De a ${count}, ${discount} % menos para cada uno.`;
}

function Confetti() {
  const pieces = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-16 bottom-0">
      {pieces.map((_, index) => {
        const palette = CUBE_PALETTES[index % CUBE_PALETTES.length];
        const left = 8 + ((index * 53) % 84);
        return (
          <motion.span
            key={index}
            className="absolute block w-2 h-2.5 rounded-[2px]"
            style={{ left: `${left}%`, backgroundColor: palette.left }}
            initial={{ y: -10, opacity: 0, rotate: 0 }}
            animate={{ y: 170, opacity: [0, 1, 1, 0], rotate: 260 + index * 25 }}
            transition={{ duration: 1.8, delay: 0.15 + (index % 6) * 0.12, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
