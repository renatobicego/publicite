import {
  ProductionBehaviourType,
  ProductionGeoLocation,
  ProductionLimits,
  ProductionVisibility,
} from "@/types/productionTypes";
import { PostLocationForm } from "@/types/postTypes";

/**
 * Comportamiento libre / agenda de los blogs personales, igual que en
 * Anuncios. Mismas reglas que el server (`production.behaviour.ts`).
 */

export const behaviourLabel: Record<ProductionBehaviourType, string> = {
  [ProductionBehaviourType.libre]: "Blog Libre",
  [ProductionBehaviourType.agenda]: "Blog de Agenda",
};

/** Alcances que admite cada comportamiento (más "Sólo yo" en los dos). */
export const behaviourVisibilities: Record<
  ProductionBehaviourType,
  ProductionVisibility[]
> = {
  [ProductionBehaviourType.libre]: [
    ProductionVisibility.public,
    ProductionVisibility.registered,
    ProductionVisibility.onlyMe,
  ],
  [ProductionBehaviourType.agenda]: [
    ProductionVisibility.contacts,
    ProductionVisibility.friends,
    ProductionVisibility.topfriends,
    ProductionVisibility.onlyMe,
  ],
};

export const defaultVisibilityFor = (behaviour: ProductionBehaviourType) =>
  behaviour === ProductionBehaviourType.agenda
    ? ProductionVisibility.contacts
    : ProductionVisibility.public;

/** Cupo disponible del comportamiento (sin tope si el flag está apagado). */
export const canCreateBlogOf = (
  limits: ProductionLimits,
  behaviour: ProductionBehaviourType
) =>
  !limits.blogLimitEnabled ||
  (behaviour === ProductionBehaviourType.agenda
    ? limits.agendaBlogsAvailable
    : limits.libreBlogsAvailable) > 0;

/** Radio por defecto (km), igual que Anuncios. */
export const DEFAULT_RATIO_KM = 5;

/** Ubicación del formulario (km) a partir de la guardada en el blog (metros). */
export const toLocationForm = (
  geo?: ProductionGeoLocation | null
): PostLocationForm => ({
  lat: geo?.latitude,
  lng: geo?.longitude,
  description: geo?.description ?? "",
  userSetted: geo?.userSetted ?? false,
  ratio: geo ? Math.round(geo.ratio / 1000) : DEFAULT_RATIO_KM,
});

/** Ubicación para el server (radio en metros) o null si falta elegirla. */
export const toGeoLocationInput = (
  location: PostLocationForm
): ProductionGeoLocation | null => {
  if (location.lat === undefined || location.lng === undefined) return null;
  return {
    latitude: location.lat,
    longitude: location.lng,
    description: location.description ?? "",
    userSetted: location.userSetted ?? false,
    ratio: (location.ratio || DEFAULT_RATIO_KM) * 1000,
  };
};

/**
 * Adapta el `setFieldValue` que usa `PlacePicker` (Formik) a un estado común:
 * recibe "geoLocation" (todo) o "geoLocation.ratio" (sólo el radio).
 */
export const locationFieldSetter =
  (setLocation: (update: (prev: PostLocationForm) => PostLocationForm) => void) =>
  (field: string, value: any) => {
    if (field === "geoLocation.ratio") {
      setLocation((prev) => ({ ...prev, ratio: value }));
    } else if (field === "geoLocation") {
      setLocation((prev) => ({ ...prev, ...value }));
    }
  };
