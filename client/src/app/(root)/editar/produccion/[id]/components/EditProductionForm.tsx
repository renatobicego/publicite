"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Image, Input, Link, Spinner, Textarea } from "@nextui-org/react";
import { FaImage } from "react-icons/fa";
import imageCompression from "browser-image-compression";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { updateProduction } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS, FILE_URL, EDIT_PRODUCTION } from "@/utils/data/urls";
import {
  ProductionBehaviourType,
  ProductionOwnerType,
  ProductionResponse,
} from "@/types/productionTypes";
import { behaviourLabel } from "@/app/(root)/(explorar)/producciones/productionBehaviour";
import { visibilityLabel } from "@/app/(root)/(explorar)/producciones/productionVisibility";

/** Edición del header del blog (portada, título, descripción, bienvenida). */
const EditProductionForm = ({
  production,
}: {
  production: ProductionResponse;
}) => {
  const router = useRouter();
  const [title, setTitle] = useState(production.title);
  const [description, setDescription] = useState(production.description ?? "");
  const [welcomeText, setWelcomeText] = useState(production.welcomeText ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headerPhotoKey, setHeaderPhotoKey] = useState<string | undefined>(
    production.headerPhotoKey ?? undefined
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("fileUploader", {
    onUploadError: (e) => toastifyError(`Error al subir la portada: ${e.name}`),
  });

  const handleCoverPicked = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastifyError("La portada debe ser una imagen");
      return;
    }
    setUploadingCover(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      const res = await startUpload([compressed]);
      const key = res?.[0]?.key;
      if (!key) {
        toastifyError("No se pudo subir la portada");
        return;
      }
      setHeaderPhotoKey(key);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toastifyError("El título del blog es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await updateProduction(production._id, {
        title: title.trim(),
        description: description.trim(),
        welcomeText: welcomeText.trim(),
        headerPhotoKey,
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Blog actualizado");
      router.push(`${PRODUCTIONS}/${production._id}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full flex flex-col gap-4 max-w-2xl">
      {/* Portada del blog */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Portada</span>
        <div className="w-full h-40 rounded-lg border border-dashed flex items-center justify-center overflow-hidden bg-default-100">
          {uploadingCover ? (
            <Spinner />
          ) : headerPhotoKey ? (
            <Image
              removeWrapper
              alt="Portada del blog"
              src={`${FILE_URL}${headerPhotoKey}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-default-400 text-sm">Sin portada</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            startContent={<FaImage />}
            onPress={() => coverInputRef.current?.click()}
            isDisabled={uploadingCover}
            isLoading={uploadingCover}
          >
            {headerPhotoKey ? "Cambiar portada" : "Subir portada"}
          </Button>
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverPicked}
        />
      </div>

      <Input
        isRequired
        label="Título del blog"
        value={title}
        onValueChange={setTitle}
        maxLength={120}
      />
      <Textarea
        label="Descripción"
        value={description}
        onValueChange={setDescription}
        maxLength={500}
      />
      <Textarea
        label="Texto de bienvenida"
        value={welcomeText}
        onValueChange={setWelcomeText}
        maxLength={500}
      />
      <PrimaryButton
        onClick={handleSubmit}
        disabled={isSubmitting || uploadingCover}
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </PrimaryButton>

      {/* Comportamiento libre / agenda (sólo blogs personales), como Anuncios */}
      {production.ownerType === ProductionOwnerType.User &&
        production.viewer?.canManageAccess && (
          <BehaviourSummary production={production} />
        )}
    </section>
  );
};

const BehaviourSummary = ({ production }: { production: ProductionResponse }) => {
  const behaviour = production.behaviourType ?? ProductionBehaviourType.libre;
  const other =
    behaviour === ProductionBehaviourType.libre
      ? ProductionBehaviourType.agenda
      : ProductionBehaviourType.libre;
  const geo = production.geoLocation;
  return (
    <div
      id="production-behaviour"
      className="flex flex-col gap-2 items-start border-t pt-4"
    >
      <p className="text-sm">
        Comportamiento: <strong>{behaviourLabel[behaviour]}</strong> ·{" "}
        {visibilityLabel[production.visibility]}
      </p>
      {behaviour === ProductionBehaviourType.libre && (
        <p className="text-xs text-default-500">
          {geo
            ? `Ubicación: ${geo.description || "sin dirección"} · radio de ${Math.round(geo.ratio / 1000)} km`
            : "Todavía no tiene ubicación: elegila para que aparezca por cercanía."}
        </p>
      )}
      <PrimaryButton
        as={Link}
        href={`${EDIT_PRODUCTION}/${production._id}/comportamiento`}
      >
        Editar Comportamiento
      </PrimaryButton>
      <small>
        Cambiar de {behaviourLabel[behaviour]} a {behaviourLabel[other]}
        {behaviour === ProductionBehaviourType.libre
          ? ", o cambiar la ubicación y el radio de alcance"
          : ""}
      </small>
    </div>
  );
};

export default EditProductionForm;
