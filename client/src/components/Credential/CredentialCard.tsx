"use client";
import { Image } from "@nextui-org/react";
import { QRCodeSVG } from "qrcode.react";
import ImagePreview from "./ImagePreview";
import { FILE_URL, PROFILE } from "@/utils/data/urls";
import { resolveCredentialColor } from "@/utils/data/credentialColors";

export interface CredentialCardProps {
  userId: string;
  displayName: string;
  /** Foto de perfil: se usa en la credencial si no tiene foto propia. */
  profilePhotoUrl?: string | null;
  /** Foto propia de la credencial (key de UploadThing). Sin ella, la de perfil. */
  credentialPhotoUrl?: string | null;
  /** Color decorativo del recuadro (#rrggbb). */
  credentialColor?: string | null;
  credentialId?: string | null;
  /** Al lado del título de la credencial. */
  headerAction?: React.ReactNode;
  /** Datos de la credencial (profesión, descripción, ubicación…). */
  children?: React.ReactNode;
  /** Debajo del QR (acciones de contacto). */
  footer?: React.ReactNode;
}

/**
 * Credencial del cartel: panel rojo con su foto propia + datos y QR al cartel
 * (`/perfiles/:id`), con el recuadro del color que eligió el usuario. La foto de
 * perfil, el nombre y el usuario van por fuera (en `UserInfo`).
 */
const CredentialCard = ({
  userId,
  displayName,
  profilePhotoUrl,
  credentialPhotoUrl,
  credentialColor,
  credentialId,
  headerAction,
  children,
  footer,
}: CredentialCardProps) => {
  const color = resolveCredentialColor(credentialColor);
  const credentialPhoto = credentialPhotoUrl
    ? `${FILE_URL}${credentialPhotoUrl}`
    : profilePhotoUrl || undefined;
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${PROFILE}/${userId}`
      : `${PROFILE}/${userId}`;

  return (
    <div
      className="flex flex-col sm:flex-row rounded-2xl border-[3px] overflow-hidden bg-white w-full"
      style={{ borderColor: color }}
    >
      {/* IZQUIERDA (ROJO): foto de la credencial */}
      <div className="bg-primary text-white p-4 sm:w-2/5 flex flex-col items-start justify-between gap-3">
        <div className="flex w-full items-start justify-between gap-2">
          <h3 className="font-semibold text-sm md:text-base leading-tight">
            Credencial SoonPublicité
          </h3>
          {headerAction}
        </div>
        <ImagePreview
          src={credentialPhoto}
          alt={`foto de credencial de ${displayName}`}
          className="self-end"
        >
          <Image
            src={credentialPhoto}
            alt={`foto de credencial de ${displayName}`}
            radius="full"
            removeWrapper
            className="block size-32 md:size-36 lg:size-44 object-cover border-4 border-white bg-white/20"
          />
        </ImagePreview>
      </div>

      {/* DERECHA: datos de la credencial */}
      <div className="p-4 sm:w-3/5 flex flex-col justify-start gap-3 min-w-0">
        <div className="flex flex-col gap-1.5">{children}</div>

        <div className="flex items-end gap-3">
          <div className="bg-white p-1.5 rounded-lg border border-default-200 shrink-0">
            <QRCodeSVG value={profileUrl} size={72} />
          </div>
          {credentialId && (
            <span className="text-xs tracking-widest text-default-600">
              {credentialId}
            </span>
          )}
        </div>

        {footer && <div className="mt-auto">{footer}</div>}
      </div>
    </div>
  );
};

export default CredentialCard;
