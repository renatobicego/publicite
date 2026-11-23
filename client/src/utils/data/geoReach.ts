/**
 * Alcance de anuncios y blogs geolocalizados: radio, zona o todo el mundo.
 * Espejo de `server/src/contexts/module_shared/geo-reach` (se cambian juntos).
 */

export type GeoReachScope = "radius" | "zone" | "world";

export type GeoZoneLevel =
  | "neighborhood"
  | "city"
  | "province"
  | "country"
  | "continent";

/** Zonas de un punto como las manda el cliente (nombre + place_id de Google). */
export interface GeoAreasInput {
  countryCode?: string | null;
  country?: string | null;
  province?: string | null;
  provinceId?: string | null;
  city?: string | null;
  cityId?: string | null;
  neighborhood?: string | null;
  neighborhoodId?: string | null;
}

export interface GeoArea {
  key: string;
  name: string;
}

/** Zonas guardadas en el anuncio o el blog (las arma el server). */
export type GeoAreas = Partial<Record<GeoZoneLevel, GeoArea | null>>;

/** Niveles de zona del más grande al más chico, como los discos del selector. */
export const ZONE_LEVELS_DESC: GeoZoneLevel[] = [
  "continent",
  "country",
  "province",
  "city",
  "neighborhood",
];

export const ZONE_LEVEL_LABEL: Record<GeoZoneLevel, string> = {
  continent: "Continente",
  country: "País",
  province: "Provincia",
  city: "Ciudad",
  neighborhood: "Barrio",
};

/** Continentes por código de país: mismo listado que el server. */
const CONTINENTS: Record<string, { name: string; countries: string }> = {
  SA: { name: "América del Sur", countries: "AR BO BR CL CO EC FK GF GY PE PY SR UY VE" },
  NA: {
    name: "América del Norte, Central y el Caribe",
    countries:
      "US CA MX GL PM BM BZ CR SV GT HN NI PA AG AI AW BB BL BQ BS CU CW DM DO GD GP HT JM KN KY LC MF MQ MS PR SX TC TT VC VG VI",
  },
  EU: {
    name: "Europa",
    countries:
      "AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK",
  },
  AS: {
    name: "Asia",
    countries:
      "AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE",
  },
  AF: {
    name: "África",
    countries:
      "AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW",
  },
  OC: {
    name: "Oceanía",
    countries: "AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV UM VU WF WS",
  },
  AN: { name: "Antártida", countries: "AQ BV GS HM TF" },
};

export const continentNameOf = (countryCode?: string | null) => {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  return (
    Object.values(CONTINENTS).find(({ countries }) =>
      countries.split(" ").includes(code)
    )?.name ?? null
  );
};

/** Nombre de cada nivel a partir de lo que devolvió el geocodificador. */
export const zoneNamesOf = (
  areas?: GeoAreasInput | null
): Partial<Record<GeoZoneLevel, string>> => {
  if (!areas?.countryCode) return {};
  const names: Partial<Record<GeoZoneLevel, string>> = {};
  const continent = continentNameOf(areas.countryCode);
  if (continent) names.continent = continent;
  if (areas.country) names.country = areas.country;
  if (areas.province) names.province = areas.province;
  if (areas.city) names.city = areas.city;
  if (areas.neighborhood) names.neighborhood = areas.neighborhood;
  return names;
};

/** Texto de dónde se ve ("Sólo en Palermo", "En todo el mundo", "Radio de 5 km"). */
export const geoReachSummary = (geo?: {
  scope?: GeoReachScope | null;
  zoneLevel?: GeoZoneLevel | null;
  areas?: GeoAreas | null;
  /** En metros. */
  ratio?: number | null;
}) => {
  if (!geo) return null;
  if (geo.scope === "world") return "En todo el mundo";
  if (geo.scope === "zone" && geo.zoneLevel) {
    const name = geo.areas?.[geo.zoneLevel]?.name;
    return name
      ? `Sólo en ${name} (${ZONE_LEVEL_LABEL[geo.zoneLevel].toLowerCase()})`
      : `Sólo en su ${ZONE_LEVEL_LABEL[geo.zoneLevel].toLowerCase()}`;
  }
  return geo.ratio ? `Radio de ${Math.round(geo.ratio / 1000)} km` : null;
};
