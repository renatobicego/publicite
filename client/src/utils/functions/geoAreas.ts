"use client";

import { Loader } from "@googlemaps/js-api-loader";
import type { GeoAreasInput } from "@/utils/data/geoReach";

// Mismas opciones que los <Wrapper> de @googlemaps/react-wrapper y que
// `usePlacePredictions`: el Loader es un singleton y tira error si se lo crea
// con opciones distintas.
const loadGeocoder = async () => {
  if (typeof window !== "undefined" && window.google?.maps?.Geocoder) {
    return window.google.maps.Geocoder;
  }
  const { Geocoder } = (await new Loader({
    apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
    libraries: ["places"],
  }).importLibrary("geocoding")) as google.maps.GeocodingLibrary;
  return Geocoder;
};

/**
 * Tipos de Google para cada nivel, en orden de preferencia. "Ciudad" es la
 * localidad (en el conurbano, la localidad y no el partido) y, si no hay, el
 * partido o departamento.
 */
const LEVEL_TYPES = {
  province: ["administrative_area_level_1"],
  city: ["locality", "postal_town", "administrative_area_level_2"],
  neighborhood: ["neighborhood", "sublocality_level_1", "sublocality"],
} as const;

const findLevel = (
  results: google.maps.GeocoderResult[],
  types: readonly string[]
): { name: string; id: string | null } | null => {
  for (const type of types) {
    // Preferimos el resultado propio de ese nivel: trae su place_id, que es
    // igual en cualquier idioma (el nombre depende del idioma del navegador).
    const own = results.find((result) => result.types.includes(type));
    const ownComponent = own?.address_components.find((c) => c.types.includes(type));
    if (own && ownComponent) return { name: ownComponent.long_name, id: own.place_id };
    for (const result of results) {
      const component = result.address_components.find((c) => c.types.includes(type));
      if (component) return { name: component.long_name, id: null };
    }
  }
  return null;
};

/** Zonas (país, provincia, ciudad, barrio) de un resultado de geocodificación inversa. */
export const extractGeoAreas = (
  results: google.maps.GeocoderResult[]
): GeoAreasInput | null => {
  let country: google.maps.GeocoderAddressComponent | undefined;
  for (const result of results) {
    country = result.address_components.find((c) => c.types.includes("country"));
    if (country) break;
  }
  if (!country) return null;

  const province = findLevel(results, LEVEL_TYPES.province);
  const city = findLevel(results, LEVEL_TYPES.city);
  const neighborhood = findLevel(results, LEVEL_TYPES.neighborhood);
  return {
    countryCode: country.short_name,
    country: country.long_name,
    province: province?.name ?? null,
    provinceId: province?.id ?? null,
    city: city?.name ?? null,
    cityId: city?.id ?? null,
    // Un "barrio" con el mismo nombre que la ciudad no es un barrio.
    neighborhood: neighborhood && neighborhood.name !== city?.name ? neighborhood.name : null,
    neighborhoodId:
      neighborhood && neighborhood.name !== city?.name ? neighborhood.id : null,
  };
};

const TIMEOUT_MS = 5000;
const STORAGE_PREFIX = "soon-geo-areas:";
const pending = new Map<string, Promise<GeoAreasInput | null>>();

/** ~11 m: dos pedidos del mismo lugar comparten la respuesta. */
const cacheKey = (lat: number, lng: number) => `${lat.toFixed(4)},${lng.toFixed(4)}`;

/**
 * Zonas de un punto con el geocodificador de Google (cada consulta se paga).
 * Se guardan por sesión y se comparten entre las listas que piden a la vez.
 * Si Google no responde, devuelve null: se sigue sin zonas.
 */
export const reverseGeocodeAreas = (
  lat: number,
  lng: number
): Promise<GeoAreasInput | null> => {
  const key = cacheKey(lat, lng);
  try {
    const stored = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (stored) return Promise.resolve(JSON.parse(stored));
  } catch {
    // sessionStorage no disponible: se consulta igual.
  }
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const request = (async () => {
    try {
      const Geocoder = await loadGeocoder();
      const geocode = new Geocoder()
        .geocode({ location: { lat, lng } })
        .then(({ results }) => extractGeoAreas(results));
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS));
      const areas = await Promise.race([geocode, timeout]);
      if (areas) {
        try {
          sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(areas));
        } catch {
          // Sin lugar en sessionStorage: no se guarda.
        }
      }
      return areas;
    } catch {
      return null;
    } finally {
      pending.delete(key);
    }
  })();
  pending.set(key, request);
  return request;
};

/** Agrega las zonas a la ubicación de quien mira (para las listas). */
export const withGeoAreas = async <T extends { latitude: number; longitude: number }>(
  coordinates: T | null
): Promise<(T & { areas: GeoAreasInput | null }) | null> => {
  if (!coordinates) return null;
  const areas = await reverseGeocodeAreas(coordinates.latitude, coordinates.longitude);
  // Sólo latitud, longitud y zonas: el input de GraphQL no acepta otros campos.
  return { latitude: coordinates.latitude, longitude: coordinates.longitude, areas } as T & {
    areas: GeoAreasInput | null;
  };
};
