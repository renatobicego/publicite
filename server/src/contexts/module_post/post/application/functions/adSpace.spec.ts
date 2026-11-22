import { normalizeAdSpace } from './adSpace';
import { AdSpaceMedium } from '../../domain/entity/enum/post-adspace.enums';

describe('normalizeAdSpace', () => {
  it('radio: pide banda, frecuencia y alcance, y descarta campos de otros medios', () => {
    const res = normalizeAdSpace({
      medium: AdSpaceMedium.radio,
      mediaName: ' Radio Sol ',
      band: 'FM' as any,
      frequency: '99.5',
      coverageArea: 'province' as any,
      coverageName: 'Mendoza',
      formats: ['Spot 30"', 'spot 30"', 'Mención'],
      followers: 1000,
      placeAddress: 'no va',
    });
    expect(res).toEqual({
      medium: 'radio',
      mediaName: 'Radio Sol',
      audience: null,
      formats: ['Spot 30"', 'Mención'],
      mediaUrl: null,
      coverageArea: 'province',
      coverageName: 'Mendoza',
      band: 'FM',
      frequency: '99.5',
      program: null,
      schedule: null,
    });
  });

  it('vía pública exige dirección; online exige link válido', () => {
    expect(() =>
      normalizeAdSpace({
        medium: AdSpaceMedium.outdoor,
        mediaName: 'Cartel',
        outdoorType: 'LED',
      }),
    ).toThrow('Falta la dirección del espacio.');
    expect(() =>
      normalizeAdSpace({
        medium: AdSpaceMedium.influencer,
        mediaName: 'Ana',
        networks: ['Instagram'],
        mediaUrl: 'instagram.com/ana',
      }),
    ).toThrow('http');
    expect(
      normalizeAdSpace({
        medium: AdSpaceMedium.influencer,
        mediaName: 'Ana',
        networks: ['Instagram'],
        mediaUrl: 'https://instagram.com/ana',
        followers: 12000,
      }).followers,
    ).toBe(12000);
  });

  it('rechaza medio inválido y falta de datos', () => {
    expect(() => normalizeAdSpace(null)).toThrow();
    expect(() => normalizeAdSpace({ medium: 'cine' as any, mediaName: 'x' })).toThrow();
    expect(() =>
      normalizeAdSpace({ medium: AdSpaceMedium.tv, mediaName: 'Canal 7' }),
    ).toThrow('Falta el alcance del medio.');
  });
});
