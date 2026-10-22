"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionLimits,
  updateProductionBehaviour,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS } from "@/utils/data/urls";
import {
  ProductionBehaviourType,
  ProductionLimits,
  ProductionResponse,
  ProductionVisibility,
} from "@/types/productionTypes";
import { PostLocationForm } from "@/types/postTypes";
import SelectProductionBehaviour from "@/app/(root)/(explorar)/producciones/components/SelectProductionBehaviour";
import BlogLimitReached from "@/app/(root)/(explorar)/producciones/components/BlogLimitReached";
import BlogBehaviourFields from "@/app/(root)/(explorar)/producciones/components/BlogBehaviourFields";
import {
  behaviourVisibilities,
  canCreateBlogOf,
  defaultVisibilityFor,
  toGeoLocationInput,
  toLocationForm,
} from "@/app/(root)/(explorar)/producciones/productionBehaviour";

/**
 * Cambio de comportamiento de un blog personal, como
 * `EditPostBehaviourType` de Anuncios: valida el cupo del comportamiento
 * nuevo y ajusta el alcance; pasar a libre pide ubicación y radio.
 */
const EditProductionBehaviour = ({
  production,
}: {
  production: ProductionResponse;
}) => {
  const router = useRouter();
  const current = production.behaviourType ?? ProductionBehaviourType.libre;
  const [behaviourType, setBehaviourType] =
    useState<ProductionBehaviourType>(current);
  const [visibility, setVisibility] = useState<ProductionVisibility>(
    production.visibility
  );
  const [location, setLocation] = useState<PostLocationForm>(
    toLocationForm(production.geoLocation)
  );
  const [showLocationError, setShowLocationError] = useState(false);
  const [limits, setLimits] = useState<ProductionLimits | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getProductionLimits().then((res) => {
      if (!active) return;
      if (isProductionActionError(res)) toastifyError(res.error);
      else setLimits(res);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSelect = (type: ProductionBehaviourType) => {
    setBehaviourType(type);
    // Al volver al comportamiento actual se conserva el alcance que tenía.
    setVisibility(
      type === current &&
        behaviourVisibilities[type].includes(production.visibility)
        ? production.visibility
        : defaultVisibilityFor(type)
    );
  };

  // El blog ya cuenta en su comportamiento actual: sólo se valida el cupo
  // al pasar al otro.
  const isChanging = behaviourType !== current;
  const limitReached =
    isChanging && !!limits && !canCreateBlogOf(limits, behaviourType);

  const handleSubmit = async () => {
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
      const res = await updateProductionBehaviour(
        production._id,
        behaviourType,
        visibility,
        geoLocation ?? undefined
      );
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Comportamiento actualizado");
      router.push(`${PRODUCTIONS}/${production._id}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full flex flex-col gap-4 max-w-2xl">
      <SelectProductionBehaviour
        type={behaviourType}
        setType={handleSelect}
        isDisabled={isSubmitting}
      />
      {limitReached && limits ? (
        <BlogLimitReached
          behaviourType={behaviourType}
          count={
            behaviourType === ProductionBehaviourType.agenda
              ? limits.agendaBlogCount
              : limits.libreBlogCount
          }
          limit={
            behaviourType === ProductionBehaviourType.agenda
              ? limits.totalAgendaBlogLimit
              : limits.totalLibreBlogLimit
          }
          onBack={() => handleSelect(current)}
        />
      ) : (
        <>
          <BlogBehaviourFields
            behaviourType={behaviourType}
            visibility={visibility}
            setVisibility={setVisibility}
            location={location}
            setLocation={setLocation}
            showLocationError={showLocationError}
            isDisabled={isSubmitting}
          />
          {production.hasAccessKey && (
            <p className="text-xs text-default-500">
              El blog tiene una clave activa: mientras esté, el alcance no se
              aplica (salvo «Sólo yo»).
            </p>
          )}
          <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar comportamiento"}
          </PrimaryButton>
        </>
      )}
    </section>
  );
};

export default EditProductionBehaviour;
