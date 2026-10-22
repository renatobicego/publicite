"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@bprogress/next/app";
import { Button, Image, Input, Textarea, Link, Spinner } from "@nextui-org/react";
import { FaImage } from "react-icons/fa";
import imageCompression from "browser-image-compression";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  createProduction,
  getProductionConsumption,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  EDIT_PRODUCTION,
  PRODUCTIONS,
  FILE_URL,
} from "@/utils/data/urls";
import {
  ProductionBehaviourType,
  ProductionBlogConsumption,
  ProductionLimits,
  ProductionOwnerType,
  ProductionRole,
  ProductionVisibility,
} from "@/types/productionTypes";
import { PostLocationForm } from "@/types/postTypes";
import SelectProductionBehaviour from "@/app/(root)/(explorar)/producciones/components/SelectProductionBehaviour";
import BlogLimitReached from "@/app/(root)/(explorar)/producciones/components/BlogLimitReached";
import BlogBehaviourFields from "@/app/(root)/(explorar)/producciones/components/BlogBehaviourFields";
import {
  canCreateBlogOf,
  defaultVisibilityFor,
  toGeoLocationInput,
  toLocationForm,
} from "@/app/(root)/(explorar)/producciones/productionBehaviour";

/**
 * Alta de un blog de Mis Producciones (personal o de grupo).
 * Un blog personal es libre o de agenda, como un anuncio: primero se elige el
 * comportamiento y se valida su cupo del plan; un blog libre además pide
 * ubicación y radio. Los blogs de grupo no tienen comportamiento.
 */
const CreateProductionForm = ({ groupId }: { groupId?: string }) => {
  const router = useRouter();
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [limits, setLimits] = useState<ProductionLimits | null>(null);
  const [behaviourType, setBehaviourType] = useState<
    ProductionBehaviourType | undefined
  >(undefined);
  const [visibility, setVisibility] = useState<ProductionVisibility>(
    ProductionVisibility.public
  );
  const [location, setLocation] = useState<PostLocationForm>(toLocationForm());
  const [showLocationError, setShowLocationError] = useState(false);
  // Blog personal que ya tiene el usuario (cuando su plan permite uno solo).
  const [ownBlog, setOwnBlog] = useState<ProductionBlogConsumption | null>(
    null
  );
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
      const consumption = await getProductionConsumption();
      if (!active) return;
      if (isProductionActionError(consumption)) {
        toastifyError(consumption.error);
        setLimits(null);
      } else {
        const { limits, blogs } = consumption;
        setLimits(limits);
        setOwnBlog(
          blogs.find(
            (blog) =>
              blog.ownerType === ProductionOwnerType.User &&
              blog.role === ProductionRole.admin
          ) ?? null
        );
      }
      setLoadingLimits(false);
    })();
    return () => {
      active = false;
    };
  }, [groupId]);

  const handleSelectBehaviour = (type: ProductionBehaviourType) => {
    setBehaviourType(type);
    setVisibility(defaultVisibilityFor(type));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toastifyError("El título del blog es obligatorio");
      return;
    }
    const geoLocation =
      behaviourType === ProductionBehaviourType.libre
        ? toGeoLocationInput(location)
        : null;
    if (behaviourType === ProductionBehaviourType.libre && !geoLocation) {
      setShowLocationError(true);
      toastifyError("Elegí la ubicación del blog en el mapa");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createProduction({
        title: title.trim(),
        description: description.trim() || undefined,
        welcomeText: welcomeText.trim() || undefined,
        headerPhotoKey,
        groupId,
        ...(groupId
          ? { visibility: ProductionVisibility.public }
          : {
              behaviourType,
              visibility,
              geoLocation: geoLocation ?? undefined,
            }),
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Blog creado con éxito");
      router.push(`${PRODUCTIONS}/${res._id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingLimits) {
    return <p className="text-sm">Cargando…</p>;
  }

  if (!limits) {
    return (
      <p className="text-sm text-danger">
        No se pudieron cargar los límites de tu plan. Probá de nuevo más tarde.
      </p>
    );
  }

  // Blog de grupo: cupo de blogs de grupo, sin comportamiento.
  if (groupId) {
    if (limits.blogLimitEnabled && limits.groupBlogsAvailable <= 0) {
      return (
        <BlogLimitReached
          count={limits.groupBlogCount}
          limit={limits.totalGroupBlogLimit}
        />
      );
    }
  } else if (!behaviourType) {
    return (
      <section className="w-full flex flex-col gap-4 max-w-2xl">
        <SelectProductionBehaviour
          type={behaviourType}
          setType={handleSelectBehaviour}
        />
        {ownBlog && (
          <p className="text-xs text-default-500">
            Ya tenés el blog «{ownBlog.title}».{" "}
            <Link
              href={`${PRODUCTIONS}/${ownBlog.productionId}`}
              size="sm"
              className="text-xs"
            >
              Ir a mi blog
            </Link>{" "}
            ·{" "}
            <Link
              href={`${EDIT_PRODUCTION}/${ownBlog.productionId}`}
              size="sm"
              className="text-xs"
            >
              Editar blog
            </Link>
          </p>
        )}
      </section>
    );
  } else if (!canCreateBlogOf(limits, behaviourType)) {
    const isAgenda = behaviourType === ProductionBehaviourType.agenda;
    return (
      <BlogLimitReached
        behaviourType={behaviourType}
        count={isAgenda ? limits.agendaBlogCount : limits.libreBlogCount}
        limit={
          isAgenda ? limits.totalAgendaBlogLimit : limits.totalLibreBlogLimit
        }
        onBack={() => setBehaviourType(undefined)}
      />
    );
  }

  return (
    <section className="w-full flex flex-col gap-4 max-w-2xl">
      {!groupId && (
        <SelectProductionBehaviour
          type={behaviourType}
          setType={handleSelectBehaviour}
          isDisabled={isSubmitting}
        />
      )}
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
      {!groupId && behaviourType && (
        <BlogBehaviourFields
          behaviourType={behaviourType}
          visibility={visibility}
          setVisibility={setVisibility}
          location={location}
          setLocation={setLocation}
          showLocationError={showLocationError}
          isDisabled={isSubmitting}
        />
      )}
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
