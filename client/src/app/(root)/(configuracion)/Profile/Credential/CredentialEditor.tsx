"use client";
import { useRef, useState } from "react";
import { Button, Progress } from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";
import { FaCheck } from "react-icons/fa6";
import { useRouter } from "@bprogress/next/app";
import DataBox from "../../DataBox";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import CredentialCard from "@/components/Credential/CredentialCard";
import useUploadImage from "@/utils/hooks/useUploadImage";
import { putMyCredential } from "@/services/userServices";
import { CredentialSettings } from "@/types/userTypes";
import {
  CREDENTIAL_COLORS,
  credentialTextColor,
  resolveCredentialColor,
} from "@/utils/data/credentialColors";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

/**
 * Foto y color de la credencial del cartel. La foto es propia de la credencial
 * (la de perfil se sigue mostrando por fuera); el color es sólo decorativo.
 */
const CredentialEditor = ({
  credential,
  profesion,
  location,
  displayName,
}: {
  credential: CredentialSettings;
  profesion?: string;
  location?: string;
  displayName?: string;
}) => {
  const { user } = useUser();
  const router = useRouter();
  const { submitFiles, progress, deleteFile } = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);

  const [saved, setSaved] = useState<CredentialSettings>(credential);
  const [photo, setPhoto] = useState<string | null>(
    credential.credentialPhotoUrl ?? null
  );
  const [color, setColor] = useState<string>(
    resolveCredentialColor(credential.credentialColor)
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const savedPhoto = saved.credentialPhotoUrl ?? null;
  const savedColor = resolveCredentialColor(saved.credentialColor);
  const isDirty = photo !== savedPhoto || color !== savedColor;
  /** Foto subida en esta edición que todavía no se guardó. */
  const pendingPhoto = photo && photo !== savedPhoto ? photo : null;

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastifyError("Elegí una imagen.");
      return;
    }
    setIsUploading(true);
    try {
      const key = await submitFiles(file);
      if (!key) return;
      if (pendingPhoto) await deleteFile(pendingPhoto);
      setPhoto(key);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (pendingPhoto) await deleteFile(pendingPhoto);
    setPhoto(null);
  };

  const handleCancel = async () => {
    if (pendingPhoto) await deleteFile(pendingPhoto);
    setPhoto(savedPhoto);
    setColor(savedColor);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await putMyCredential({
      credentialPhotoUrl: photo,
      credentialColor: color,
    });
    setIsSaving(false);
    if ("error" in res) {
      toastifyError(res.error);
      return;
    }
    // La foto anterior ya no la usa nadie: se borra de UploadThing.
    const previous = res.previousCredentialPhotoUrl;
    if (previous && previous !== photo) await deleteFile(previous);
    setSaved({ credentialPhotoUrl: photo, credentialColor: color });
    toastifySuccess("Credencial actualizada");
    router.refresh();
  };

  const name = displayName || user?.fullName || user?.username || "";

  return (
    <DataBox
      labelText="Credencial"
      className="!items-start my-2.5"
      labelClassname="mt-1"
    >
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full">
        <CredentialCard
          userId={(user?.publicMetadata?.mongoId as string) ?? ""}
          displayName={name}
          credentialPhotoUrl={photo}
          profilePhotoUrl={user?.imageUrl}
          credentialColor={color}
          profesion={profesion}
          location={location}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Foto de la credencial</p>
          <p className="text-xs text-default-500">
            Es distinta de tu foto de perfil. Si no subís una, se usa la de
            perfil.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <PrimaryButton
              size="sm"
              variant="bordered"
              isLoading={isUploading}
              isDisabled={isUploading || isSaving}
              onPress={() => inputRef.current?.click()}
            >
              {photo ? "Cambiar foto" : "Subir foto"}
            </PrimaryButton>
            {photo && (
              <Button
                size="sm"
                radius="full"
                variant="light"
                isDisabled={isUploading || isSaving}
                onPress={handleRemovePhoto}
              >
                Quitar foto
              </Button>
            )}
          </div>
          {isUploading && progress > 0 && (
            <Progress
              size="sm"
              value={progress}
              color="secondary"
              aria-label="subiendo foto"
              className="max-w-xs"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Color del recuadro</p>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {CREDENTIAL_COLORS.map((option) => {
              const selected = option.value === color;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.label}
                  title={option.label}
                  onClick={() => setColor(option.value)}
                  className={`size-8 rounded-full border border-black/10 flex items-center justify-center transition-transform hover:scale-110 ${
                    selected ? "ring-2 ring-offset-2 ring-default-400" : ""
                  }`}
                  style={{ backgroundColor: option.value }}
                >
                  {selected && (
                    <FaCheck
                      className="size-3"
                      style={{ color: credentialTextColor(option.value) }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {isDirty && (
          <div className="flex gap-2">
            <Button
              radius="full"
              variant="light"
              isDisabled={isSaving || isUploading}
              onPress={handleCancel}
            >
              Cancelar
            </Button>
            <PrimaryButton
              isLoading={isSaving}
              isDisabled={isSaving || isUploading}
              onPress={handleSave}
            >
              Guardar credencial
            </PrimaryButton>
          </div>
        )}
      </div>
    </DataBox>
  );
};

export default CredentialEditor;
