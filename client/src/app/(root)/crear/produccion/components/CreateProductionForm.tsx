"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Image, Input, Textarea, Link, Spinner } from "@nextui-org/react";
import { FaImage } from "react-icons/fa";
import imageCompression from "browser-image-compression";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  createProduction,
  getProductionLimits,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS, SUBSCRIPTIONS, PACKS, FILE_URL } from "@/utils/data/urls";
import { ProductionVisibility } from "@/types/productionTypes";

/**
 * Alta de un blog de Mis Producciones (personal o de grupo).
 * Gate de plan: consulta `getProductionLimits` antes de mostrar el formulario.
 */
const CreateProductionForm = ({ groupId }: { groupId?: string }) => {
  const router = useRouter();
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headerPhotoKey, setHeaderPhotoKey] = useState<string | undefined>(
    undefined
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

  useEffect(() => {
    let active = true;
    (async () => {
      const limits = await getProductionLimits();
      if (!active) return;
      if (isProductionActionError(limits)) {
        toastifyError(limits.error);
        setCanCreate(false);
      } else {
        const available = groupId
          ? limits.groupBlogsAvailable
          : limits.personalBlogsAvailable;
        setCanCreate(available > 0);
      }
      setLoadingLimits(false);
    })();
    return () => {
      active = false;
    };
  }, [groupId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toastifyError("El título del blog es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createProduction({
        title: title.trim(),
        description: description.trim() || undefined,
        welcomeText: welcomeText.trim() || undefined,
        headerPhotoKey,
        visibility: ProductionVisibility.public,
        groupId,
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Blog creado con éxito");
      router.push(`${PRODUCTIONS}/${res._id}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingLimits) {
    return <p className="text-sm">Cargando…</p>;
  }

  if (!canCreate) {
    return (
      <section className="w-full flex flex-col items-center gap-4 rounded-lg border p-6">
        <h4 className="text-center">
          {groupId
            ? "Alcanzaste el límite de blogs de grupo de tu plan."
            : "Ya tenés tu blog personal. Tu plan permite un único blog personal."}
        </h4>
        <p className="text-sm text-center md:max-w-[60%]">
          Para crear un nuevo blog, cambiá de plan o comprá un pack de
          publicaciones.
        </p>
        <div className="flex gap-2 items-center">
          <PrimaryButton as={Link} href={SUBSCRIPTIONS}>
            Cambiar Plan
          </PrimaryButton>
          <SecondaryButton as={Link} href={PACKS}>
            Comprar Packs
          </SecondaryButton>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col gap-4 max-w-2xl">
      {/* Portada del blog */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Portada (opcional)</span>
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
          {headerPhotoKey && !uploadingCover && (
            <Button
              variant="light"
              color="danger"
              onPress={() => setHeaderPhotoKey(undefined)}
            >
              Quitar
            </Button>
          )}
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
        placeholder="Mi blog"
        value={title}
        onValueChange={setTitle}
        maxLength={120}
      />
      <Textarea
        label="Descripción (opcional)"
        placeholder="De qué trata tu blog"
        value={description}
        onValueChange={setDescription}
        maxLength={500}
      />
      <Textarea
        label="Texto de bienvenida (opcional)"
        placeholder="Bienvenidos a mi blog"
        value={welcomeText}
        onValueChange={setWelcomeText}
        maxLength={500}
      />
      <PrimaryButton
        onClick={handleSubmit}
        disabled={isSubmitting || uploadingCover}
      >
        {isSubmitting ? "Creando…" : "Crear blog"}
      </PrimaryButton>
    </section>
  );
};

export default CreateProductionForm;
