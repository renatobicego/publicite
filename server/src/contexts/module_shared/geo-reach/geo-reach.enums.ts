import { registerEnumType } from '@nestjs/graphql';

/**
 * Cómo se limita dónde se ve un anuncio o un blog geolocalizado:
 *
 * - radius: dentro de un radio desde su ubicación (lo de siempre, 1-200 km).
 * - zone: sólo para quien está en la misma zona (barrio, ciudad, provincia,
 *   país o continente) que la ubicación del anuncio.
 * - world: para todos, estén donde estén.
 *
 * Sin el campo (anuncios y blogs anteriores) es `radius`.
 */
export enum GeoReachScope {
  radius = 'radius',
  zone = 'zone',
  world = 'world',
}

/** Niveles de zona, de más chico a más grande. */
export enum GeoZoneLevel {
  neighborhood = 'neighborhood',
  city = 'city',
  province = 'province',
  country = 'country',
  continent = 'continent',
}

export const GEO_ZONE_LEVELS: GeoZoneLevel[] = [
  GeoZoneLevel.neighborhood,
  GeoZoneLevel.city,
  GeoZoneLevel.province,
  GeoZoneLevel.country,
  GeoZoneLevel.continent,
];

registerEnumType(GeoReachScope, {
  name: 'GeoReachScope',
  description: 'radius = radio; zone = misma zona administrativa; world = todo el mundo',
});

registerEnumType(GeoZoneLevel, {
  name: 'GeoZoneLevel',
  description: 'Nivel de zona: barrio, ciudad/partido, provincia, país o continente',
});
