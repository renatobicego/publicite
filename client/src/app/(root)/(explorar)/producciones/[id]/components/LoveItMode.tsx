"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@nextui-org/react";
import { FaTimes } from "react-icons/fa";
import {
  ProductionItemResponse,
  ProductionPhotoVote,
} from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../../productionMedia";
import { LOVE_IT_VOTES, voteMeta } from "../../productionCollections";

interface Props {
  albumName: string;
  /** Fotos que el usuario puede ver (con key), en el orden del álbum. */
  photos: ProductionItemResponse[];
  /** Votos ya guardados del usuario, por id de foto. */
  votes: Map<string, ProductionPhotoVote>;
  onVote: (itemId: string, vote: ProductionPhotoVote) => void;
  onClose: () => void;
}

// Cuánto hay que llevar la foto para que cuente como voto (px), y a partir de
// cuánto se marca la dirección en la que va.
const COMMIT_DISTANCE = 110;
const HINT_DISTANCE = 30;
// Un gesto corto y rápido (un "flick") también vota.
const FLICK_DISTANCE = 50;
const FLICK_MS = 250;
// Duración del vuelo de la foto al votar.
const FLY_MS = 220;
const PRELOAD_AHEAD = 3;

type Drag = { x: number; y: number };

/** Dirección dominante del gesto → voto (arriba Fan, derecha Me gusta…). */
const voteFromDrag = ({ x, y }: Drag): ProductionPhotoVote => {
  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? ProductionPhotoVote.like : ProductionPhotoVote.no;
  }
  return y < 0 ? ProductionPhotoVote.fan : ProductionPhotoVote.maybe;
};

// Dónde va cada voto en la pantalla.
const EDGE_POSITION: Record<ProductionPhotoVote, string> = {
  [ProductionPhotoVote.fan]: "top-16 left-1/2 -translate-x-1/2",
  [ProductionPhotoVote.like]: "right-2 top-1/2 -translate-y-1/2 sm:right-6",
  [ProductionPhotoVote.maybe]: "bottom-6 left-1/2 -translate-x-1/2",
  [ProductionPhotoVote.no]: "left-2 top-1/2 -translate-y-1/2 sm:left-6",
};

/**
 * Love It: recorre las fotos del álbum una por una, a pantalla completa y con
 * fondo negro. Cada foto se lleva hacia una hora del reloj: 12 h Fan, 15 h Me
 * gusta, 18 h Más o menos, 21 h No. En compu con el mouse o las flechas; en
 * celular y tablet, deslizando. El voto se guarda al instante y se puede
 * cambiar volviendo a pasar.
 */
const LoveItMode = ({ albumName, photos, votes, onVote, onClose }: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  // Arranca en la primera foto sin votar; si ya votó todas, desde el principio.
  const [index, setIndex] = useState(() => {
    const firstPending = photos.findIndex((photo) => !votes.has(photo._id));
    return firstPending === -1 ? 0 : firstPending;
  });
  const [drag, setDrag] = useState<Drag>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState<ProductionPhotoVote | null>(null);
  const start = useRef<{ x: number; y: number; time: number } | null>(null);

  const done = index >= photos.length;
  const photo = done ? null : photos[index];
  const currentVote = photo ? votes.get(photo._id) : undefined;

  const distance = Math.hypot(drag.x, drag.y);
  const hinted =
    flying ?? (distance > HINT_DISTANCE ? voteFromDrag(drag) : null);
  const hintedMeta = voteMeta(hinted);

  // Pantalla completa de verdad en celular y tablet (donde se puede), y sin
  // scroll de la página de atrás mientras está abierto.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && overlayRef.current?.requestFullscreen) {
      overlayRef.current.requestFullscreen().catch(() => undefined);
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => undefined);
      }
    };
  }, []);

  // Las próximas fotos se precargan para que pasar sea instantáneo.
  useEffect(() => {
    photos.slice(index + 1, index + 1 + PRELOAD_AHEAD).forEach((next) => {
      const image = new Image();
      image.src = resolveProductionFileUrl(next.key);
    });
  }, [index, photos]);

  const commitVote = useCallback(
    (vote: ProductionPhotoVote) => {
      if (!photo || flying) return;
      navigator.vibrate?.(15);
      onVote(photo._id, vote);
      setFlying(vote);
      window.setTimeout(() => {
        setIndex((current) => current + 1);
        setFlying(null);
        setDrag({ x: 0, y: 0 });
      }, FLY_MS);
    },
    [photo, flying, onVote]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      const option = LOVE_IT_VOTES.find((entry) => entry.key === event.key);
      if (option) {
        event.preventDefault();
        commitVote(option.vote);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commitVote, onClose]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (flying || !photo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = { x: event.clientX, y: event.clientY, time: Date.now() };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!start.current) return;
    setDrag({
      x: event.clientX - start.current.x,
      y: event.clientY - start.current.y,
    });
  };

  const onPointerUp = () => {
    if (!start.current) return;
    const elapsed = Date.now() - start.current.time;
    start.current = null;
    setDragging(false);
    const isFlick = elapsed < FLICK_MS && distance > FLICK_DISTANCE;
    if (distance > COMMIT_DISTANCE || isFlick) {
      commitVote(voteFromDrag(drag));
    } else {
      setDrag({ x: 0, y: 0 });
    }
  };

  const restart = () => {
    setIndex(0);
    setDrag({ x: 0, y: 0 });
  };

  // La foto sigue al dedo; al votar sale volando hacia su hora del reloj.
  const transform = useMemo(() => {
    if (flying) {
      const meta = voteMeta(flying)!;
      return `translate(${meta.dx * 120}vw, ${meta.dy * 120}vh) rotate(${
        meta.dx * 18
      }deg)`;
    }
    return `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 25}deg)`;
  }, [drag, flying]);

  const nextPhoto = photos[index + 1];

  const content = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Love It · ${albumName}`}
      className="fixed inset-0 z-[1000] select-none overflow-hidden bg-black text-white"
    >
      {/* Brillo del color del voto hacia el que va la foto */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{
          background: hintedMeta
            ? `radial-gradient(circle at ${50 + hintedMeta.dx * 50}% ${
                50 + hintedMeta.dy * 50
              }%, ${hintedMeta.color}66, transparent 60%)`
            : undefined,
          opacity: hintedMeta
            ? flying
              ? 1
              : Math.min(1, distance / COMMIT_DISTANCE)
            : 0,
        }}
      />

      {/* Barra superior */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 py-3">
        <p className="truncate text-sm font-semibold">
          <span className="mr-2 rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold tracking-wide">
            Love It
          </span>
          {albumName}
        </p>
        <Button
          isIconOnly
          radius="full"
          variant="light"
          aria-label="Cerrar Love It"
          className="text-white"
          onPress={onClose}
        >
          <FaTimes />
        </Button>
      </div>

      {done ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="text-6xl">💖</span>
          <p className="text-xl font-semibold">¡Listo! Pasaste todas las fotos</p>
          <p className="max-w-sm text-sm text-white/70">
            Tus votos ya quedaron guardados. Podés volver a pasar cuando quieras
            y cambiar lo que votaste.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button radius="full" variant="bordered" className="border-white/40 text-white" onPress={restart}>
              Volver a pasar
            </Button>
            <Button radius="full" color="primary" onPress={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Foto siguiente, quieta debajo: al votar ya está ahí */}
          {nextPhoto && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16 pb-20 pt-28 sm:px-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveProductionFileUrl(nextPhoto.key)}
                alt=""
                draggable={false}
                className="max-h-full max-w-full scale-95 object-contain opacity-40"
              />
            </div>
          )}

          {/* Foto actual: se arrastra (mouse) o se desliza (dedo) */}
          <div
            className="absolute inset-0 z-10 flex touch-none items-center justify-center px-16 pb-20 pt-28 sm:px-28"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {photo && (
              <div
                className="relative flex max-h-full max-w-full cursor-grab items-center justify-center active:cursor-grabbing"
                style={{
                  transform,
                  transition: dragging
                    ? "none"
                    : `transform ${flying ? FLY_MS : 200}ms ease-out, opacity ${FLY_MS}ms ease-out`,
                  opacity: flying ? 0 : 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={photo._id}
                  src={resolveProductionFileUrl(photo.key)}
                  alt={photo.name}
                  draggable={false}
                  className="max-h-[calc(100dvh-12rem)] max-w-full object-contain shadow-2xl"
                />
                {hintedMeta && (
                  <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl px-5 py-3 text-2xl font-bold shadow-xl"
                    style={{
                      backgroundColor: `${hintedMeta.color}e6`,
                      opacity: flying ? 1 : Math.min(1, distance / COMMIT_DISTANCE),
                    }}
                  >
                    {hintedMeta.emoji} {hintedMeta.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Voto anterior de esta foto (se puede cambiar) */}
          {currentVote && !hinted && (
            <div className="pointer-events-none absolute inset-x-0 top-28 z-20 flex justify-center">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                Ya votaste: {voteMeta(currentVote)?.emoji}{" "}
                {voteMeta(currentVote)?.label}
              </span>
            </div>
          )}

          {/* Las cuatro horas del reloj: también se tocan para votar */}
          {LOVE_IT_VOTES.map((option) => {
            const active = hinted === option.vote;
            return (
              <button
                key={option.vote}
                type="button"
                onClick={() => commitVote(option.vote)}
                aria-label={`${option.label} (${option.clock})`}
                className={`absolute z-20 flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-center transition-all duration-150 ${
                  EDGE_POSITION[option.vote]
                } ${active ? "scale-125" : "bg-white/10 hover:bg-white/20"}`}
                style={active ? { backgroundColor: option.color } : undefined}
              >
                <span className="text-2xl leading-none">{option.emoji}</span>
                <span className="text-xs font-semibold">{option.label}</span>
                <span className="hidden text-[10px] text-white/60 md:block">
                  {option.clock}
                </span>
              </button>
            );
          })}

          {/* Ayuda */}
          <p className="pointer-events-none absolute inset-x-0 bottom-24 z-20 hidden text-center text-xs text-white/50 md:block">
            Llevá la foto hacia una hora del reloj o usá las flechas del teclado
          </p>
          <p className="pointer-events-none absolute inset-x-0 bottom-24 z-20 text-center text-xs text-white/50 md:hidden">
            Deslizá la foto hacia un costado
          </p>
        </>
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export default LoveItMode;
