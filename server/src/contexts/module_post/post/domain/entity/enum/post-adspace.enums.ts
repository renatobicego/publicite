import { registerEnumType } from '@nestjs/graphql';

/** Medio del espacio publicitario: cada uno es una solapa de Explorar. */
export enum AdSpaceMedium {
  radio = 'radio',
  streaming = 'streaming',
  tv = 'tv',
  outdoor = 'outdoor', // vía pública
  newspaper = 'newspaper', // diario
  magazine = 'magazine', // revista
  influencer = 'influencer',
}

registerEnumType(AdSpaceMedium, {
  name: 'AdSpaceMedium',
  description: 'Medio del espacio publicitario',
});

/** Alcance declarado de un medio con cobertura (radio, TV, diario, revista). */
export enum AdSpaceCoverage {
  neighborhood = 'neighborhood', // barrio
  city = 'city', // ciudad / localidad
  district = 'district', // partido / departamento / distrito
  province = 'province',
  region = 'region', // varias provincias
  country = 'country',
  international = 'international',
}

registerEnumType(AdSpaceCoverage, {
  name: 'AdSpaceCoverage',
  description: 'Alcance declarado del medio',
});

export enum AdSpaceBand {
  AM = 'AM',
  FM = 'FM',
}

registerEnumType(AdSpaceBand, { name: 'AdSpaceBand' });

export enum AdSpaceEdition {
  print = 'print',
  digital = 'digital',
  both = 'both',
}

registerEnumType(AdSpaceEdition, { name: 'AdSpaceEdition' });

/**
 * Cómo se ubica cada medio: un lugar físico (dirección), algo de internet
 * (link) o un área de cobertura (barrio, provincia, país…). Es aparte del
 * radio de publicación del anuncio (geolocalizado), que decide quién lo ve.
 */
export type AdSpaceReach = 'place' | 'online' | 'area';

export const AD_SPACE_REACH: Record<AdSpaceMedium, AdSpaceReach> = {
  [AdSpaceMedium.radio]: 'area',
  [AdSpaceMedium.tv]: 'area',
  [AdSpaceMedium.newspaper]: 'area',
  [AdSpaceMedium.magazine]: 'area',
  [AdSpaceMedium.outdoor]: 'place',
  [AdSpaceMedium.streaming]: 'online',
  [AdSpaceMedium.influencer]: 'online',
};
