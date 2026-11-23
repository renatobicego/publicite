import { BadRequestException } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Schema, model } from 'mongoose';

import { GeoReachScope, GeoZoneLevel } from './geo-reach.enums';
import {
  buildGeoAreas,
  buildGeoReachExpr,
  continentOf,
  geoReachSchemaFields,
  normalizeGeoReach,
} from './geo-reach';

const PALERMO = {
  countryCode: 'AR',
  country: 'Argentina',
  province: 'Ciudad Autónoma de Buenos Aires',
  provinceId: 'CABA',
  city: 'Buenos Aires',
  cityId: 'BA-CITY',
  neighborhood: 'Palermo',
  neighborhoodId: 'PALERMO',
};
const CABALLITO = { ...PALERMO, neighborhood: 'Caballito', neighborhoodId: 'CABALLITO' };
const LA_PLATA = {
  countryCode: 'AR',
  country: 'Argentina',
  province: 'Provincia de Buenos Aires',
  provinceId: 'PBA',
  city: 'La Plata',
  cityId: 'LA-PLATA',
};
const MONTEVIDEO = {
  countryCode: 'UY',
  country: 'Uruguay',
  province: 'Departamento de Montevideo',
  provinceId: 'MVD-DEP',
  city: 'Montevideo',
  cityId: 'MVD',
};
const MADRID = { countryCode: 'ES', country: 'España', province: 'Comunidad de Madrid', city: 'Madrid' };

// [lng, lat]
const POINTS = {
  palermo: [-58.43, -34.58],
  caballito: [-58.44, -34.62],
  laPlata: [-57.95, -34.92],
  montevideo: [-56.16, -34.9],
  madrid: [-3.7, 40.42],
};

describe('geo-reach: zonas', () => {
  it('arma claves con el place_id y deriva el continente', () => {
    const areas = buildGeoAreas(PALERMO)!;
    expect(areas.country).toEqual({ key: 'AR', name: 'Argentina' });
    expect(areas.continent).toEqual({ key: 'SA', name: 'América del Sur' });
    expect(areas.province?.key).toBe('g:CABA');
    expect(areas.neighborhood?.name).toBe('Palermo');
  });

  it('sin place_id usa un camino de nombres sin tildes ni prefijos', () => {
    const areas = buildGeoAreas({ countryCode: 'ar', province: 'Provincia de Córdoba', city: 'Río Cuarto' })!;
    expect(areas.province?.key).toBe('AR/cordoba');
    expect(areas.city?.key).toBe('AR/cordoba/rio-cuarto');
    expect(buildGeoAreas({ countryCode: 'AR', province: 'Córdoba' })!.province?.key).toBe('AR/cordoba');
  });

  it('sin código de país no hay zonas', () => {
    expect(buildGeoAreas({ country: 'Argentina' })).toBeNull();
    expect(buildGeoAreas(null)).toBeNull();
  });

  it('continentes', () => {
    expect(continentOf('UY')?.key).toBe('SA');
    expect(continentOf('MX')?.key).toBe('NA');
    expect(continentOf('ES')?.key).toBe('EU');
    expect(continentOf('ZZ')).toBeNull();
  });

  it('valida el alcance', () => {
    expect(normalizeGeoReach(null).scope).toBe(GeoReachScope.radius);
    expect(normalizeGeoReach({ scope: GeoReachScope.world }).zoneLevel).toBeNull();
    expect(() => normalizeGeoReach({ scope: GeoReachScope.zone, areas: PALERMO })).toThrow(
      BadRequestException,
    );
    // La Plata no tiene barrio: no se puede limitar al barrio.
    expect(() =>
      normalizeGeoReach({ scope: GeoReachScope.zone, zoneLevel: GeoZoneLevel.neighborhood, areas: LA_PLATA }),
    ).toThrow(/barrio/);
    const ok = normalizeGeoReach({ scope: GeoReachScope.zone, zoneLevel: GeoZoneLevel.province, areas: LA_PLATA });
    expect(ok.areas?.province?.key).toBe('g:PBA');
  });
});

describe('geo-reach: filtro en Mongo', () => {
  let mongod: MongoMemoryServer;
  let Ad: any;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    const AdSchema = new Schema({
      name: String,
      geoLocation: {
        location: { type: { type: String }, coordinates: [Number] },
        ratio: Number,
        ...geoReachSchemaFields,
      },
    });
    AdSchema.index({ 'geoLocation.location': '2dsphere' });
    Ad = model('GeoReachTestAd', AdSchema);
    await Ad.init();

    const ad = (name: string, point: number[], ratioKm: number, reach: any, areas: any) => {
      const normalized = reach ? normalizeGeoReach({ ...reach, areas }) : null;
      return {
        name,
        geoLocation: {
          location: { type: 'Point', coordinates: point },
          ratio: ratioKm * 1000,
          ...(normalized ?? {}),
        },
      };
    };
    await Ad.create([
      // Anterior a la zonificación: sin scope, radio de 400 km desde Palermo.
      ad('viejo-400km', POINTS.palermo, 400, null, null),
      ad('radio-5km', POINTS.palermo, 5, { scope: GeoReachScope.radius }, PALERMO),
      ad('solo-caba', POINTS.palermo, 5, { scope: GeoReachScope.zone, zoneLevel: GeoZoneLevel.province }, PALERMO),
      ad('solo-palermo', POINTS.palermo, 5, { scope: GeoReachScope.zone, zoneLevel: GeoZoneLevel.neighborhood }, PALERMO),
      ad('solo-pba', POINTS.laPlata, 5, { scope: GeoReachScope.zone, zoneLevel: GeoZoneLevel.province }, LA_PLATA),
      ad('solo-argentina', POINTS.laPlata, 5, { scope: GeoReachScope.zone, zoneLevel: GeoZoneLevel.country }, LA_PLATA),
      ad('sudamerica', POINTS.laPlata, 5, { scope: GeoReachScope.zone, zoneLevel: GeoZoneLevel.continent }, LA_PLATA),
      ad('mundo', POINTS.palermo, 5, { scope: GeoReachScope.world }, PALERMO),
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  const visibleFrom = async (point: number[], areasInput: any) => {
    const docs = await Ad.aggregate([
      { $geoNear: { near: { type: 'Point', coordinates: point }, distanceField: 'distance', spherical: true } },
      { $match: { $expr: buildGeoReachExpr('$distance', buildGeoAreas(areasInput)) } },
    ]);
    return docs.map((doc: any) => doc.name).sort();
  };

  it('desde Palermo', async () => {
    expect(await visibleFrom(POINTS.palermo, PALERMO)).toEqual(
      ['mundo', 'radio-5km', 'solo-argentina', 'solo-caba', 'solo-palermo', 'sudamerica', 'viejo-400km'].sort(),
    );
  });

  it('desde Caballito: misma provincia, otro barrio', async () => {
    const names = await visibleFrom(POINTS.caballito, CABALLITO);
    expect(names).toContain('solo-caba');
    expect(names).not.toContain('solo-palermo');
  });

  it('desde Montevideo: un radio de 400 km llega, CABA y Argentina no', async () => {
    expect(await visibleFrom(POINTS.montevideo, MONTEVIDEO)).toEqual(['mundo', 'sudamerica', 'viejo-400km']);
  });

  it('desde La Plata: Provincia de Buenos Aires no es CABA', async () => {
    const names = await visibleFrom(POINTS.laPlata, LA_PLATA);
    expect(names).toContain('solo-pba');
    expect(names).not.toContain('solo-caba');
  });

  it('desde Madrid sólo lo de todo el mundo', async () => {
    expect(await visibleFrom(POINTS.madrid, MADRID)).toEqual(['mundo']);
  });

  it('sin saber la zona de quien mira, las de zona no aparecen', async () => {
    expect(await visibleFrom(POINTS.palermo, null)).toEqual(['mundo', 'radio-5km', 'viejo-400km']);
  });
});
