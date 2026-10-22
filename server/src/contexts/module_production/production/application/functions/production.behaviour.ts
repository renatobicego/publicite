import { BadRequestException } from '@nestjs/common';

import {
  ProductionBehaviourType,
  ProductionVisibility,
} from '../../domain/entity/enum/production.enums';
import { ProductionGeoLocation } from '../../domain/entity/production.entity';

/**
 * Comportamiento libre / agenda de los blogs personales, igual que en Anuncios
 * (`PostBehaviourType`). Los blogs de grupo no tienen comportamiento.
 */

/** Alcances de un blog libre: público o registrados (más "Sólo yo"). */
export const LIBRE_VISIBILITIES: ProductionVisibility[] = [
  ProductionVisibility.public,
  ProductionVisibility.registered,
  ProductionVisibility.onlyMe,
];

/** Alcances de un blog de agenda: niveles de la agenda (más "Sólo yo"). */
export const AGENDA_VISIBILITIES: ProductionVisibility[] = [
  ProductionVisibility.contacts,
  ProductionVisibility.friends,
  ProductionVisibility.topfriends,
  ProductionVisibility.onlyMe,
];

/** Radio de alcance de un blog libre, en metros (igual que Anuncios: 1-200 km). */
export const MIN_GEO_RATIO_METERS = 1000;
export const MAX_GEO_RATIO_METERS = 200000;

export function allowedVisibilitiesFor(
  behaviourType: ProductionBehaviourType,
): ProductionVisibility[] {
  return behaviourType === ProductionBehaviourType.agenda
    ? AGENDA_VISIBILITIES
    : LIBRE_VISIBILITIES;
}

/** Alcance por defecto al elegir un comportamiento (como Anuncios). */
export function defaultVisibilityFor(
  behaviourType: ProductionBehaviourType,
): ProductionVisibility {
  return behaviourType === ProductionBehaviourType.agenda
    ? ProductionVisibility.contacts
    : ProductionVisibility.public;
}

/** Rechaza un alcance que no corresponde al comportamiento del blog. */
export function assertVisibilityMatchesBehaviour(
  behaviourType: ProductionBehaviourType | null,
  visibility: ProductionVisibility,
): void {
  if (!behaviourType) return;
  if (allowedVisibilitiesFor(behaviourType).includes(visibility)) return;
  throw new BadRequestException(
    behaviourType === ProductionBehaviourType.agenda
      ? 'Un blog de agenda sólo puede verlo tu agenda de contactos (contactos, amigos o top amigos) o sólo vos'
      : 'Un blog libre sólo puede ser público, para registrados o sólo para vos',
  );
}

/** Valida y normaliza la ubicación + radio de un blog libre. */
export function normalizeGeoLocation(
  geo:
    | {
        latitude: number;
        longitude: number;
        description?: string | null;
        userSetted?: boolean | null;
        ratio: number;
      }
    | null
    | undefined,
): ProductionGeoLocation {
  if (!geo) {
    throw new BadRequestException(
      'Un blog libre necesita una ubicación y un radio de alcance',
    );
  }
  const { latitude, longitude, ratio } = geo;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new BadRequestException('La ubicación del blog no es válida');
  }
  if (
    !Number.isFinite(ratio) ||
    ratio < MIN_GEO_RATIO_METERS ||
    ratio > MAX_GEO_RATIO_METERS
  ) {
    throw new BadRequestException(
      'El radio de alcance debe estar entre 1 y 200 km',
    );
  }
  return {
    location: { type: 'Point', coordinates: [longitude, latitude] },
    description: geo.description?.trim() ?? '',
    userSetted: !!geo.userSetted,
    ratio: Math.round(ratio),
  };
}

/**
 * Distancia en metros (haversine) entre la ubicación del blog y la del
 * visitante, como expresión de agregación. Se usa en vez de `$geoNear` para
 * no dejar afuera a los blogs sin ubicación (grupo, agenda o anteriores al
 * comportamiento), que `$geoNear` descarta.
 */
export function buildDistanceMetersExpr(latitude: number, longitude: number) {
  const EARTH_RADIUS_METERS = 6371000;
  const blogLng = {
    $degreesToRadians: { $arrayElemAt: ['$geoLocation.location.coordinates', 0] },
  };
  const blogLat = {
    $degreesToRadians: { $arrayElemAt: ['$geoLocation.location.coordinates', 1] },
  };
  const userLat = (latitude * Math.PI) / 180;
  const userLng = (longitude * Math.PI) / 180;

  const sinHalfDeltaLat = { $sin: { $divide: [{ $subtract: [blogLat, userLat] }, 2] } };
  const sinHalfDeltaLng = { $sin: { $divide: [{ $subtract: [blogLng, userLng] }, 2] } };
  const a = {
    $add: [
      { $pow: [sinHalfDeltaLat, 2] },
      {
        $multiply: [
          Math.cos(userLat),
          { $cos: blogLat },
          { $pow: [sinHalfDeltaLng, 2] },
        ],
      },
    ],
  };
  return {
    $multiply: [
      2 * EARTH_RADIUS_METERS,
      { $asin: { $sqrt: { $min: [1, a] } } },
    ],
  };
}
