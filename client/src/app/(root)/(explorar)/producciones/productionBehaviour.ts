import {
  ProductionBehaviourType,
  ProductionGeoLocationInput,
  ProductionGeoLocationResponse,
  ProductionLimits,
  ProductionVisibility,
} from "@/types/productionTypes";
import { PostLocationForm } from "@/types/postTypes";

/**
 * Comportamiento libre / agenda de los blogs personales, igual que en
 * Anuncios. Mismas reglas que el server (`production.behaviour.ts`).
 */

// "libre" es el nombre interno: en pantalla, "geolocalizado".
export const behaviourLabel: Record<ProductionBehaviourType, string> = {
  [ProductionBehaviourType.libre]: "Blog geolocalizado",
  [ProductionBehaviourType.agenda]: "Blog de mi agenda",
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
  geo?: ProductionGeoLocationResponse | null
): PostLocationForm => ({
  lat: geo?.latitude,
  lng: geo?.longitude,
  description: geo?.description ?? "",
  userSetted: geo?.userSetted ?? false,
  ratio: geo ? Math.round(geo.ratio / 1000) : DEFAULT_RATIO_KM,
  scope: geo?.scope ?? "radius",
  zoneLevel: geo?.zoneLevel ?? null,
  // Las zonas se vuelven a leer del punto (PlacePicker) al abrir el formulario.
  areas: null,
});

/** Ubicación para el server (radio en metros) o null si falta elegirla. */
export const toGeoLocationInput = (
  location: PostLocationForm
): ProductionGeoLocationInput | null => {
  if (location.lat === undefined || location.lng === undefined) return null;
  return {
    latitude: location.lat,
    longitude: location.lng,
    description: location.description ?? "",
    userSetted: location.userSetted ?? false,
    ratio: (location.ratio || DEFAULT_RATIO_KM) * 1000,
    scope: location.scope ?? "radius",
    zoneLevel: location.scope === "zone" ? location.zoneLevel ?? null : null,
    areas: location.areas ?? null,
  };
};

/**
 * Adapta el `setFieldValue` que usa `PlacePicker` (Formik) a un estado común:
 * recibe "geoLocation" (todo) o "geoLocation.<campo>" (radio, alcance, zonas…).
 */
export const locationFieldSetter =
  (setLocation: (update: (prev: PostLocationForm) => PostLocationForm) => void) =>
  (field: string, value: any) => {
    if (field.startsWith("geoLocation.")) {
      const key = field.slice("geoLocation.".length) as keyof PostLocationForm;
      setLocation((prev) => ({ ...prev, [key]: value }));
    } else if (field === "geoLocation") {
      setLocation((prev) => ({ ...prev, ...value }));
    }
  };
