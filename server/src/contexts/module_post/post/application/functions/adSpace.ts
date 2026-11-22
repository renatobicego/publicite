import { BadRequestException } from '@nestjs/common';
import {
  AD_SPACE_REACH,
  AdSpaceBand,
  AdSpaceCoverage,
  AdSpaceEdition,
  AdSpaceMedium,
} from '../../domain/entity/enum/post-adspace.enums';

/** Datos propios de un espacio publicitario (`Post.adSpace`). */
export interface AdSpaceData {
  medium: AdSpaceMedium;
  mediaName: string;
  audience?: string | null;
  formats?: string[];
  mediaUrl?: string | null;
  // Alcance según el medio (ver AD_SPACE_REACH)
  coverageArea?: AdSpaceCoverage | null;
  coverageName?: string | null;
  placeAddress?: string | null;
  // Radio / streaming / TV
  band?: AdSpaceBand | null;
  frequency?: string | null;
  platform?: string | null;
  program?: string | null;
  schedule?: string | null;
  // Vía pública
  outdoorType?: string | null;
  dimensions?: string | null;
  illuminated?: boolean | null;
  // Diario / revista
  edition?: AdSpaceEdition | null;
  periodicity?: string | null;
  circulation?: string | null;
  section?: string | null;
  // Influencers
  networks?: string[];
  handle?: string | null;
  followers?: number | null;
  engagement?: string | null;
}

const MAX_TEXT = 120;
const MAX_LIST = 10;
const MAX_LIST_ITEM = 60;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/** Campos propios de cada medio; el resto se descarta. */
const MEDIUM_FIELDS: Record<AdSpaceMedium, (keyof AdSpaceData)[]> = {
  [AdSpaceMedium.radio]: ['band', 'frequency', 'program', 'schedule'],
  [AdSpaceMedium.streaming]: ['platform', 'program', 'schedule'],
  [AdSpaceMedium.tv]: ['program', 'schedule'],
  [AdSpaceMedium.outdoor]: ['outdoorType', 'dimensions', 'illuminated'],
  [AdSpaceMedium.newspaper]: ['edition', 'periodicity', 'circulation', 'section'],
  [AdSpaceMedium.magazine]: ['edition', 'periodicity', 'circulation', 'section'],
  [AdSpaceMedium.influencer]: ['networks', 'handle', 'followers', 'engagement'],
};

/** Obligatorios además de medio y nombre del medio. */
const MEDIUM_REQUIRED: Record<AdSpaceMedium, (keyof AdSpaceData)[]> = {
  [AdSpaceMedium.radio]: ['band', 'frequency'],
  [AdSpaceMedium.streaming]: ['platform'],
  [AdSpaceMedium.tv]: [],
  [AdSpaceMedium.outdoor]: ['outdoorType'],
  [AdSpaceMedium.newspaper]: ['edition'],
  [AdSpaceMedium.magazine]: ['edition'],
  [AdSpaceMedium.influencer]: ['networks'],
};

const FIELD_LABEL: Partial<Record<keyof AdSpaceData, string>> = {
  mediaName: 'el nombre del medio',
  band: 'la banda (AM o FM)',
  frequency: 'la frecuencia',
  platform: 'la plataforma',
  outdoorType: 'el tipo de soporte',
  edition: 'la edición (papel, digital o ambas)',
  networks: 'al menos una red social',
  coverageArea: 'el alcance del medio',
  placeAddress: 'la dirección del espacio',
  mediaUrl: 'el link al sitio o perfil',
};

const fail = (message: string): never => {
  throw new BadRequestException(message);
};

const text = (value: unknown, field: string): string | null => {
  if (value === undefined || value === null) return null;
  const v = String(value).trim();
  if (!v) return null;
  if (v.length > MAX_TEXT) {
    fail(`${field} puede tener hasta ${MAX_TEXT} caracteres.`);
  }
  return v;
};

const list = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    const v = String(item ?? '').trim();
    if (!v || seen.has(v.toLowerCase())) continue;
    if (v.length > MAX_LIST_ITEM) {
      fail(`Cada valor de ${field} puede tener hasta ${MAX_LIST_ITEM} caracteres.`);
    }
    seen.add(v.toLowerCase());
    out.push(v);
  }
  if (out.length > MAX_LIST) fail(`Podés cargar hasta ${MAX_LIST} ${field}.`);
  return out;
};

const oneOf = <T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  field: string,
): T | null => {
  if (value === undefined || value === null || value === '') return null;
  const found = Object.values(allowed).find((a) => a === value);
  if (!found) fail(`${field} no es válido.`);
  return found as T;
};

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

/**
 * Valida y limpia los datos del espacio según el medio. Lo usan el alta y la
 * edición; los campos que no son del medio se descartan.
 */
export function normalizeAdSpace(input: Partial<AdSpaceData> | null | undefined): AdSpaceData {
  if (!input) fail('Faltan los datos del espacio publicitario.');
  const medium = oneOf(input!.medium, AdSpaceMedium, 'El medio');
  if (!medium) fail('Elegí el medio del espacio publicitario.');
  const m = medium as AdSpaceMedium;

  const mediaUrl = text(input!.mediaUrl, 'El link');
  if (mediaUrl && !URL_REGEX.test(mediaUrl)) {
    fail('El link tiene que empezar con http:// o https://');
  }

  const all: AdSpaceData = {
    medium: m,
    mediaName: text(input!.mediaName, 'El nombre del medio') ?? '',
    audience: text(input!.audience, 'La audiencia'),
    formats: list(input!.formats, 'formatos'),
    mediaUrl,
    coverageArea: oneOf(input!.coverageArea, AdSpaceCoverage, 'El alcance'),
    coverageName: text(input!.coverageName, 'El lugar del alcance'),
    placeAddress: text(input!.placeAddress, 'La dirección'),
    band: oneOf(input!.band, AdSpaceBand, 'La banda'),
    frequency: text(input!.frequency, 'La frecuencia'),
    platform: text(input!.platform, 'La plataforma'),
    program: text(input!.program, 'El programa'),
    schedule: text(input!.schedule, 'El horario'),
    outdoorType: text(input!.outdoorType, 'El tipo de soporte'),
    dimensions: text(input!.dimensions, 'Las medidas'),
    illuminated:
      typeof input!.illuminated === 'boolean' ? input!.illuminated : null,
    edition: oneOf(input!.edition, AdSpaceEdition, 'La edición'),
    periodicity: text(input!.periodicity, 'La periodicidad'),
    circulation: text(input!.circulation, 'La tirada'),
    section: text(input!.section, 'La sección'),
    networks: list(input!.networks, 'redes'),
    handle: text(input!.handle, 'El usuario'),
    followers: null,
    engagement: text(input!.engagement, 'El engagement'),
  };
  if (input!.followers !== undefined && input!.followers !== null) {
    const f = Number(input!.followers);
    if (!Number.isInteger(f) || f < 0) fail('Los seguidores tienen que ser un número entero.');
    all.followers = f;
  }

  // Alcance según el medio: dirección, link o área de cobertura.
  const reach = AD_SPACE_REACH[m];
  const reachRequired: (keyof AdSpaceData)[] =
    reach === 'place' ? ['placeAddress'] : reach === 'online' ? ['mediaUrl'] : ['coverageArea'];

  const required: (keyof AdSpaceData)[] = [
    'mediaName',
    ...reachRequired,
    ...MEDIUM_REQUIRED[m],
  ];
  for (const field of required) {
    if (isEmpty(all[field])) fail(`Falta ${FIELD_LABEL[field] ?? field}.`);
  }

  const result: AdSpaceData = {
    medium: m,
    mediaName: all.mediaName,
    audience: all.audience,
    formats: all.formats,
    mediaUrl: all.mediaUrl,
  };
  if (reach === 'area') {
    result.coverageArea = all.coverageArea;
    result.coverageName = all.coverageName;
  }
  if (reach === 'place') result.placeAddress = all.placeAddress;
  for (const field of MEDIUM_FIELDS[m]) {
    (result as any)[field] = all[field];
  }
  return result;
}
