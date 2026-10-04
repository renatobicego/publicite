"use client";
import { useEffect, useId, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { FaMusic, FaPause, FaPlay } from "react-icons/fa6";

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

/** Formatea segundos a `m:ss`. */
const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Reproductor de audio con estilo tipo "nota de voz": ícono, título,
 * botón play/pause y la waveform REAL del archivo (decodificada por
 * `wavesurfer.js`), coloreada en naranja a medida que avanza la reproducción.
 */
const AudioPlayer = ({ src, title = "Audio", className = "" }: AudioPlayerProps) => {
  const reactId = useId();
  const containerId = `wave-${reactId.replace(/[:]/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      height: 24,
      waveColor: "#FCD9AE", // "service" (#F0931A) desaturado, barras sin reproducir
      progressColor: "#F0931A", // "service", barras ya reproducidas
      cursorWidth: 0,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      normalize: true,
      interact: true,
      url: src,
    });
    waveSurferRef.current = waveSurfer;

    waveSurfer.on("ready", (dur) => {
      setDuration(dur);
      setIsReady(true);
    });
    waveSurfer.on("audioprocess", (time) => setCurrentTime(time));
    waveSurfer.on("timeupdate", (time) => setCurrentTime(time));
    waveSurfer.on("play", () => setIsPlaying(true));
    waveSurfer.on("pause", () => setIsPlaying(false));
    waveSurfer.on("finish", () => setIsPlaying(false));

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
    // Sólo se recrea si cambia el src.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const togglePlay = () => {
    waveSurferRef.current?.playPause();
  };

  const remaining = duration ? duration - currentTime : duration;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border-2 border-service px-3 py-2 bg-white max-w-full ${className}`}
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-service text-white">
        <FaMusic className="h-4 w-4" />
      </span>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="text-sm font-medium truncate">&ldquo;{title}&rdquo;</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!isReady}
            aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-service text-white disabled:opacity-50"
          >
            {isPlaying ? (
              <FaPause className="h-2.5 w-2.5" />
            ) : (
              <FaPlay className="h-2.5 w-2.5 ml-0.5" />
            )}
          </button>
          <div
            id={containerId}
            ref={containerRef}
            className="flex-1 min-w-[120px] max-w-[220px] cursor-pointer"
          />
          <span className="text-xs text-default-500 flex-shrink-0 tabular-nums">
            {formatTime(isPlaying || currentTime > 0 ? remaining : duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
