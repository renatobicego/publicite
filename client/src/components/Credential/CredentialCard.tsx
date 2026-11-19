"use client";
import { Image } from "@nextui-org/react";
import { QRCodeSVG } from "qrcode.react";
import { TbWorldPin } from "react-icons/tb";
import { FILE_URL, PROFILE } from "@/utils/data/urls";
import {
  credentialTextColor,
  resolveCredentialColor,
} from "@/utils/data/credentialColors";

export interface CredentialCardProps {
  userId: string;
  displayName: string;
  /** Foto propia de la credencial (key de UploadThing). */
  credentialPhotoUrl?: string | null;
  /** Foto de perfil: se usa si no hay foto de credencial. */
  profilePhotoUrl?: string | null;
  credentialColor?: string | null;
  credentialId?: string | null;
  profesion?: string | null;
  location?: string | null;
  className?: string;
}

/**
 * Credencial del cartel: tarjeta chica tipo carnet con su propia foto, el
 * recuadro del color que eligió el usuario (decorativo), datos básicos y el QR
 * que apunta al cartel (`/perfiles/:id`).
 */
const CredentialCard = ({
  userId,
  displayName,
  credentialPhotoUrl,
  profilePhotoUrl,
  credentialColor,
  credentialId,
  profesion,
  location,
  className = "",
}: CredentialCardProps) => {
  const color = resolveCredentialColor(credentialColor);
  const textColor = credentialTextColor(color);
  const photo = credentialPhotoUrl
    ? `${FILE_URL}${credentialPhotoUrl}`
    : profilePhotoUrl || undefined;
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${PROFILE}/${userId}`
      : `${PROFILE}/${userId}`;

  return (
    <article
      aria-label={`Credencial de ${displayName}`}
      className={`w-full max-w-md rounded-xl border-2 bg-white overflow-hidden shadow-sm ${className}`}
      style={{ borderColor: color }}
    >
      <header
        className="flex items-center justify-between gap-2 px-3 py-1"
        style={{ backgroundColor: color, color: textColor }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
          Credencial
        </span>
        {credentialId && (
          <span className="text-[10px] tracking-widest">{credentialId}</span>
        )}
      </header>

      <div className="flex items-center gap-3 p-3">
        <Image
          src={photo}
          alt={`foto de credencial de ${displayName}`}
          radius="md"
          removeWrapper
          className="w-16 h-20 md:w-20 md:h-24 object-cover shrink-0 bg-default-100"
          style={{ outline: `2px solid ${color}`, outlineOffset: 2 }}
        />

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <p className="font-semibold leading-tight line-clamp-2">
            {displayName}
          </p>
          {profesion && (
            <p className="text-xs md:text-sm text-default-700 line-clamp-1">
              {profesion}
            </p>
          )}
          {location && (
            <p className="flex items-center gap-1 text-xs text-default-500">
              <TbWorldPin className="shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>

        <div className="shrink-0 bg-white p-1 rounded-md border border-default-200">
          <QRCodeSVG value={profileUrl} size={60} />
        </div>
      </div>
    </article>
  );
};

export default CredentialCard;
