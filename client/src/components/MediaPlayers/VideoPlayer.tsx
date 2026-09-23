"use client";
import { useEffect, useRef, useState } from "react";
import { FaExpand, FaPause, FaPlay } from "react-icons/fa6";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

/** Formatea segundos a `m:ss` (o `h:mm:ss` si dura una hora o más). */
const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Reproductor de video con controles propios (play centrado, barra de
 * progreso, tiempo transcurrido/total y botón de pantalla completa),
 * en vez de los controles nativos del navegador.
 */
const VideoPlayer = ({ src, poster, className = "" }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0); // 0..1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) setProgress(video.currentTime / video.duration);
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleSeek: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width)
    );
    video.currentTime = ratio * duration;
    setProgress(ratio);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen?.();
    }
  };

  const scheduleHideControls = () => {
    clearTimeout(hideControlsTimeout.current);
    setShowControls(true);
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(
        () => setShowControls(false),
        2500
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`group relative w-full overflow-hidden rounded-lg bg-black ${className}`}
      onMouseMove={scheduleHideControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full max-h-[70vh] object-contain"
        onClick={togglePlay}
      />

      {/* Botón central de play, visible cuando está pausado. */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Reproducir video"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white transition-transform hover:scale-105">
            <FaPlay className="h-5 w-5 ml-1" />
          </span>
        </button>
      )}

      {/* Barra de controles inferior. */}
      <div
        className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 transition-opacity ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
          className="flex-shrink-0 text-white"
        >
          {isPlaying ? (
            <FaPause className="h-4 w-4" />
          ) : (
            <FaPlay className="h-4 w-4" />
          )}
        </button>

        <span className="text-xs text-white tabular-nums flex-shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div
          className="relative flex-1 h-1.5 rounded-full bg-white/30 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-service"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-service"
            style={{ left: `${progress * 100}%` }}
          />
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Pantalla completa"
          className="flex-shrink-0 text-white"
        >
          <FaExpand className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
