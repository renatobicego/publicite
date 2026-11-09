"use client";
import { useState } from "react";
import { FaYoutube } from "react-icons/fa6";
import {
  parseYouTubeId,
  youTubeEmbedUrl,
  youTubeThumbnailUrl,
} from "@/utils/functions/youtube";

interface YouTubeEmbedProps {
  /** Id del video o link de YouTube; se valida antes de armar el iframe. */
  video: string;
  start?: number;
  title?: string;
  className?: string;
}

/**
 * Video de YouTube embebido. Muestra la miniatura y carga el reproductor
 * recién al tocarla, así un artículo con varios videos no carga todos los
 * iframes de entrada.
 */
const YouTubeEmbed = ({
  video,
  start = 0,
  title = "Video de YouTube",
  className = "",
}: YouTubeEmbedProps) => {
  const [playing, setPlaying] = useState(false);
  const videoId = parseYouTubeId(video);
  if (!videoId) return null;

  return (
    <div
      className={`relative w-full aspect-video overflow-hidden rounded-large bg-black ${className}`}
    >
      {playing ? (
        <iframe
          src={`${youTubeEmbedUrl(videoId, start)}&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir: ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youTubeThumbnailUrl(videoId)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <FaYoutube className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-[#ff0000] drop-shadow-lg transition-transform group-hover:scale-110" />
        </button>
      )}
    </div>
  );
};

export default YouTubeEmbed;
