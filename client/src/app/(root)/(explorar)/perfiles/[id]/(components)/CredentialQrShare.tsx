"use client";
import { QRCodeSVG } from "qrcode.react";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { shareLink } from "@/utils/functions/utils";
import { PROFILE } from "@/utils/data/urls";

interface Props {
  userId: string;
  /** ID decorativo de credencial (PC-02). */
  credentialId?: string | null;
  displayName?: string;
  /** Tamaño del QR en px. */
  size?: number;
}

/**
 * QR + botón "Compartir cartel" de la credencial del usuario (PC-02).
 * El QR se genera localmente y apunta al cartel (`/perfiles/:id`).
 * Vive dentro de la credencial (`UserInfo`), no en la solapa Producciones.
 */
const CredentialQrShare = ({
  userId,
  credentialId,
  displayName,
  size = 96,
}: Props) => {
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${PROFILE}/${userId}`
      : `${PROFILE}/${userId}`;

  return (
    <div className="flex flex-col  items-start  gap-3">
      <div className="bg-white p-2 rounded-lg shrink-0">
        <QRCodeSVG value={profileUrl} size={size} />
      </div>
      {credentialId && (
        <span className="text-xs tracking-widest text-default-600">
          {credentialId}
        </span>
      )}
    </div>
  );
};

export default CredentialQrShare;
