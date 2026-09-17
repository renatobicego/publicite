"use client";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardBody } from "@nextui-org/react";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { shareLink } from "@/utils/functions/utils";
import { PROFILE } from "@/utils/data/urls";

interface Props {
  userId: string;
  credentialId?: string | null;
  displayName?: string;
}

/**
 * Credencial con ID decorativo (PC-02) y QR con link al cartel del usuario.
 * El QR se genera localmente (sin llamadas a terceros).
 */
const CredentialCard = ({ userId, credentialId, displayName }: Props) => {
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${PROFILE}/${userId}`
      : `${PROFILE}/${userId}`;

  return (
    <Card shadow="sm" className="w-full max-w-sm">
      <CardBody className="flex flex-col items-center gap-3 p-5">
        <div className="bg-white p-2 rounded-lg">
          <QRCodeSVG value={profileUrl} size={140} />
        </div>
        {displayName && <span className="font-medium">{displayName}</span>}
        {credentialId && (
          <span className="text-sm tracking-widest text-default-600">
            {credentialId}
          </span>
        )}
        <SecondaryButton
          onClick={() =>
            shareLink(profileUrl, displayName || "Mi cartel en Soonpublicité")
          }
        >
          Compartir cartel
        </SecondaryButton>
      </CardBody>
    </Card>
  );
};

export default CredentialCard;
