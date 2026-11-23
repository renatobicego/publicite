import { BadRequestException } from '@nestjs/common';
import { Schema } from 'mongoose';

import { GeoReachScope, GeoZoneLevel, GEO_ZONE_LEVELS } from './geo-reach.enums';
import { GeoAreasInput } from './geo-reach.graphql';

/**
 * Zonificación de anuncios y blogs geolocalizados ("discos de cerrajería"):
 * además del radio, un anuncio puede verse sólo dentro de su barrio, ciudad,
 * provincia, país o continente, o en todo el mundo.
 *
 * Las zonas salen del geocodificador de Google en el cliente y acá se
 * convierten en claves: el `place_id` de cada nivel (`g:ChIJ…`) o, si Google no
 * lo dio, un camino de nombres (`AR/buenos-aires/la-plata`). El país es su
 * código ISO y el continente sale de una tabla. La zona del
 * anuncio se guarda al publicar y la de quien mira viaja con su ubicación
 * (`UserLocation.areas`); un anuncio de zona se ve si las dos claves del nivel
 * elegido coinciden. Es la división administrativa exacta, sin polígonos.
 */

export interface GeoArea {
  key: string;
  name: string;
}

export type GeoAreas = Partial<Record<GeoZoneLevel, GeoArea>>;

export interface GeoReach {
  scope: GeoReachScope;
  zoneLevel: GeoZoneLevel | null;
  areas: GeoAreas | null;
}

export interface GeoReachInput {
  scope?: GeoReachScope | null;
  zoneLevel?: GeoZoneLevel | null;
  areas?: GeoAreasInput | null;
}

const CONTINENTS: Record<string, { name: string; countries: string }> = {
  SA: {
    name: 'América del Sur',
    countries: 'AR BO BR CL CO EC FK GF GY PE PY SR UY VE',
  },
  NA: {
    name: 'América del Norte, Central y el Caribe',
    countries:
      'US CA MX GL PM BM BZ CR SV GT HN NI PA AG AI AW BB BL BQ BS CU CW DM DO GD GP HT JM KN KY LC MF MQ MS PR SX TC TT VC VG VI',
  },
  EU: {
    name: 'Europa',
    countries:
      'AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK',
  },
  AS: {
    name: 'Asia',
    countries:
      'AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE',
  },
  AF: {
    name: 'África',
    countries:
      'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW',
  },
  OC: {
    name: 'Oceanía',
    countries: 'AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV UM VU WF WS',
  },
  AN: { name: 'Antártida', countries: 'AQ BV GS HM TF' },
};

const CONTINENT_BY_COUNTRY = new Map<string, GeoArea>(
  Object.entries(CONTINENTS).flatMap(([key, { name, countries }]) =>
    countries.split(' ').map((code) => [code, { key, name }] as [string, GeoArea]),
  ),
);

export const continentOf = (countryCode: string): GeoArea | null =>
  CONTINENT_BY_COUNTRY.get(countryCode.toUpperCase()) ?? null;

/** Prefijos que Google agrega o no según el caso ("Provincia de Buenos Aires"). */
const NAME_PREFIXES =
  /^(provincia|departamento|partido|estado|region|región|municipio|distrito|comuna|barrio) (de |del )?/;

/** Parte de una clave: sin tildes, minúsculas y sin el prefijo administrativo. */
export const zoneKeyPart = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(NAME_PREFIXES, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const cleanName = (value?: string | null) => value?.trim().slice(0, 120) || null;

/**
 * Arma las zonas (clave + nombre) de un punto. Cada clave incluye a las de
 * arriba, así dos "San Martín" de provincias distintas no se confunden.
 * Sin un código de país válido no hay zonas.
 */
export function buildGeoAreas(input?: GeoAreasInput | null): GeoAreas | null {
  const countryCode = input?.countryCode?.trim().toUpperCase();
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return null;

  const areas: GeoAreas = {};
  const continent = continentOf(countryCode);
  if (continent) areas.continent = continent;
  areas.country = { key: countryCode, name: cleanName(input?.country) ?? countryCode };

  // La clave es el place_id de Google (igual en cualquier idioma). Sin él,
  // un camino de nombres normalizados, que incluye a los niveles de arriba.
  let parentKey = countryCode;
  const chain: [GeoZoneLevel, string | null | undefined, string | null | undefined][] = [
    [GeoZoneLevel.province, input?.province, input?.provinceId],
    [GeoZoneLevel.city, input?.city, input?.cityId],
    [GeoZoneLevel.neighborhood, input?.neighborhood, input?.neighborhoodId],
  ];
  for (const [level, rawName, rawId] of chain) {
    const name = cleanName(rawName);
    const part = name ? zoneKeyPart(name) : '';
    if (!name || !part) continue;
    parentKey = `${parentKey}/${part}`;
    const id = rawId?.trim();
    areas[level] = { key: id ? `g:${id}` : parentKey, name };
  }
  return areas;
}

/** Zonas guardadas (documento de Mongo) → `GeoAreas`, descartando basura. */
export function readGeoAreas(doc: any): GeoAreas | null {
  if (!doc) return null;
  const areas: GeoAreas = {};
  for (const level of GEO_ZONE_LEVELS) {
    const area = doc[level];
    if (area?.key && area?.name) areas[level] = { key: area.key, name: area.name };
  }
  return Object.keys(areas).length ? areas : null;
}

export const ZONE_LEVEL_LABELS: Record<GeoZoneLevel, string> = {
  [GeoZoneLevel.neighborhood]: 'el barrio',
  [GeoZoneLevel.city]: 'la ciudad',
  [GeoZoneLevel.province]: 'la provincia',
  [GeoZoneLevel.country]: 'el país',
  [GeoZoneLevel.continent]: 'el continente',
};

/**
 * Valida el alcance elegido. Para `zone` el punto tiene que tener la zona del
 * nivel pedido (Google no tiene barrios en todos lados).
 */
export function normalizeGeoReach(input?: GeoReachInput | null): GeoReach {
  const scope = input?.scope ?? GeoReachScope.radius;
  const areas = buildGeoAreas(input?.areas);

  if (scope === GeoReachScope.zone) {
    const level = input?.zoneLevel;
    if (!level || !GEO_ZONE_LEVELS.includes(level)) {
      throw new BadRequestException('Elegí en qué zona se ve: barrio, ciudad, provincia, país o continente');
    }
    if (!areas?.[level]) {
      throw new BadRequestException(
        `No pudimos reconocer ${ZONE_LEVEL_LABELS[level]} de esa ubicación. Elegí otra zona u otro punto en el mapa.`,
      );
    }
    return { scope, zoneLevel: level, areas };
  }

  return { scope, zoneLevel: null, areas };
}

/**
 * Condición de agregación "quien mira alcanza este anuncio" (va dentro de
 * `$expr`). `distance` es la distancia en metros al punto del anuncio
 * (`'$distance'` después de `$geoNear`, o una expresión haversine).
 * `field` es el camino de `geoLocation` en el documento.
 *
 * - radio (o sin `scope`, los anteriores): distancia <= radio;
 * - mundo: siempre;
 * - zona: la clave del nivel elegido coincide con la de quien mira. Si no se
 *   conoce la zona de quien mira, los anuncios de zona no se le muestran.
 */
export function buildGeoReachExpr(
  distance: any,
  viewerAreas: GeoAreas | null,
  field = '$geoLocation',
) {
  const scope = { $ifNull: [`${field}.scope`, GeoReachScope.radius] };
  const conditions: any[] = [
    {
      $and: [
        { $eq: [scope, GeoReachScope.radius] },
        { $lte: [distance, `${field}.ratio`] },
      ],
    },
    { $eq: [scope, GeoReachScope.world] },
  ];
  for (const level of GEO_ZONE_LEVELS) {
    const key = viewerAreas?.[level]?.key;
    if (!key) continue;
    conditions.push({
      $and: [
        { $eq: [scope, GeoReachScope.zone] },
        { $eq: [`${field}.zoneLevel`, level] },
        { $eq: [`${field}.areas.${level}.key`, key] },
      ],
    });
  }
  return { $or: conditions };
}

/** Campos de Mongoose del alcance, para sumar dentro de `geoLocation`. */
const GeoAreaSchema = new Schema(
  { key: { type: String, required: true }, name: { type: String, required: true } },
  { _id: false },
);

const GeoAreasSchema = new Schema(
  Object.fromEntries(
    GEO_ZONE_LEVELS.map((level) => [level, { type: GeoAreaSchema, default: undefined }]),
  ),
  { _id: false },
);

export const geoReachSchemaFields = {
  scope: { type: String, enum: Object.values(GeoReachScope) },
  zoneLevel: { type: String, enum: GEO_ZONE_LEVELS },
  areas: { type: GeoAreasSchema, default: undefined },
};
