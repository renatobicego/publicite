"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

/*
Piezas de un asistente por pasos (Hacete Amigo): el indicador de pasos, que se
puede tocar, y la transición entre pasos (desliza hacia el lado que corresponde).
*/

export interface WizardStep {
  step: number;
  label: string;
}

export function WizardSteps({
  steps,
  current,
  onSelect,
}: {
  steps: WizardStep[];
  current: number;
  onSelect: (step: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm" aria-label="Pasos">
      {steps.map((item, index) => {
        const active = item.step === current;
        const done = item.step < current;
        return (
          <li key={item.step} className="flex items-center gap-1.5 sm:gap-2">
            {index > 0 && <span className="w-3 sm:w-6 h-px bg-default-300" aria-hidden />}
            <button
              type="button"
              onClick={() => onSelect(item.step)}
              aria-current={active ? "step" : undefined}
              aria-label={`Paso ${item.step}: ${item.label}`}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${
                active
                  ? "bg-primary text-white"
                  : done
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-default-100 text-default-500 hover:bg-default-200"
              }`}
            >
              <span className="font-bold">{item.step}</span>
              {/* En celular sólo se lee el nombre del paso actual */}
              <span className={active ? "" : "hidden sm:inline"}>{item.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Paso actual y hacia dónde se movió (para deslizar hacia el lado correcto). */
export function useWizard(initial = 1) {
  const [state, setState] = useState({ step: initial, direction: 1 });
  const go = useCallback(
    (next: number) =>
      setState((current) => ({ step: next, direction: next >= current.step ? 1 : -1 })),
    []
  );
  return { step: state.step, direction: state.direction, go };
}

export function WizardSlide({
  step,
  direction,
  children,
}: {
  step: number;
  direction: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={step}
        custom={direction}
        variants={{
          enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
          center: { opacity: 1, x: 0 },
          exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
