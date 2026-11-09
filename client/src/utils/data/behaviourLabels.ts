/**
 * Nombres que ve el usuario para el comportamiento de anuncios y blogs.
 * "libre" sigue siendo el valor interno (base, API, URLs `/libres`); en
 * pantalla se llama "geolocalizado". Cambiar acá, no en cada componente.
 */

export const POST_BEHAVIOUR_LABEL = {
  libre: "Anuncio geolocalizado",
  agenda: "Anuncio de agenda",
} as const;

/** Dónde aparece el anuncio en Explorar, según su comportamiento. */
export const POST_BEHAVIOUR_DESTINATION = {
  libre: "Anuncios digitales en Soon › Geolocalizados",
  agenda: "Anuncios digitales en Soon › Agenda de contactos",
} as const;

export const PRODUCTION_BEHAVIOUR_LABEL = {
  libre: "Geolocalizada",
  agenda: "De mi agenda",
} as const;

/** Dónde aparece el blog en Explorar, según su comportamiento. */
export const PRODUCTION_BEHAVIOUR_DESTINATION = {
  libre: "Producciones › Producciones geolocalizadas",
  agenda: "Producciones › Producciones de mi agenda",
} as const;
