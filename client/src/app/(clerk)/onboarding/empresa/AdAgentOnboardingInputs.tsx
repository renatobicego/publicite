"use client";
import { useRef, useState } from "react";
import { Field, FormikErrors } from "formik";
import { Avatar, Button } from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";
import { CustomSelect, CustomTextarea } from "@/components/inputs/CustomInputs";
import { UserBusinessFormValues } from "@/types/userTypes";
import { AD_AGENT_TAX_CONDITIONS } from "@/utils/data/adSpaces";
import { toastifyError } from "@/utils/functions/toastify";

/**
 * Datos extra de la cuenta Empresa / Agente: foto o logo propio, condición
 * frente al IVA y explicación de los impuestos.
 */
const AdAgentOnboardingInputs = ({
  errors,
  hasImage,
}: {
  errors: FormikErrors<UserBusinessFormValues>;
  hasImage: boolean;
}) => {
  const { user } = useUser();
  const agentErrors = errors.adAgent as
    | Partial<Record<"taxCondition" | "taxNote", string>>
    | undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const uploadPhoto = async (file?: File) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toastifyError("Elegí una imagen.");
      return;
    }
    setUploading(true);
    try {
      await user.setProfileImage({ file });
      await user.reload();
      setUploaded(true);
    } catch {
      toastifyError("No se pudo subir la foto. Probá de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const showPhotoOk = hasImage || uploaded;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-4">
        <Avatar src={user?.imageUrl} className="size-16" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            Foto o logo <span className="text-danger">*</span>
          </p>
          <Button
            size="sm"
            radius="full"
            variant="flat"
            isLoading={uploading}
            onPress={() => inputRef.current?.click()}
          >
            {showPhotoOk ? "Cambiar foto" : "Subir foto"}
          </Button>
          {!showPhotoOk && (
            <p className="text-xs text-warning-700">
              Es obligatoria para publicar espacios publicitarios.
            </p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => uploadPhoto(e.target.files?.[0])}
        />
      </div>
      <Field
        as={CustomSelect}
        items={AD_AGENT_TAX_CONDITIONS}
        getItemValue={(item: any) => item.value}
        getItemLabel={(item: any) => item.label}
        getItemTextValue={(item: any) => item.label}
        name="adAgent.taxCondition"
        label="Condición frente al IVA"
        placeholder="Responsable Inscripto, Monotributo…"
        aria-label="condición frente al iva"
        isRequired
        isInvalid={!!agentErrors?.taxCondition}
        errorMessage={agentErrors?.taxCondition}
      />
      <Field
        as={CustomTextarea}
        name="adAgent.taxNote"
        label="Explicación de impuestos"
        aria-label="explicación de impuestos"
        placeholder="Ej: Facturo A y B. Los precios publicados no incluyen IVA (21%)."
        isRequired
        isInvalid={!!agentErrors?.taxNote}
        errorMessage={agentErrors?.taxNote}
      />
    </div>
  );
};

export default AdAgentOnboardingInputs;
