"use client";
import { useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import { FaCamera } from "react-icons/fa6";
import { useRouter } from "@bprogress/next/app";
import useUploadImage from "@/utils/hooks/useUploadImage";
import { putMyCredential } from "@/services/userServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

/**
 * Aviso dentro de la credencial propia cuando no tiene foto: sube la foto en el
 * momento (conserva el color elegido). Si el server la rechaza, se borra de
 * UploadThing.
 */
const CredentialPhotoPrompt = ({
  credentialColor,
}: {
  credentialColor?: string | null;
}) => {
  const router = useRouter();
  const { submitFiles, deleteFile } = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      const res = await putMyCredential({
        credentialPhotoUrl: key,
        credentialColor: credentialColor ?? null,
      });
      if ("error" in res) {
        await deleteFile(key);
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Foto de la credencial actualizada");
      router.refresh();
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-warning-400 bg-warning-50 px-3 py-2">
      <FaCamera className="size-4 shrink-0 text-warning-600" />
      <p className="flex-1 text-xs text-default-700">
        Tu credencial usa tu foto de perfil. Subí una foto propia para la
        credencial.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button
        size="sm"
        radius="full"
        color="warning"
        variant="flat"
        isLoading={isUploading}
        onPress={() => inputRef.current?.click()}
      >
        Subir foto
      </Button>
    </div>
  );
};

export default CredentialPhotoPrompt;
