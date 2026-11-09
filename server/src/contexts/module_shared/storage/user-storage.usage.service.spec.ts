import { describe, expect, it } from '@jest/globals';

import {
  mergePostMediaSizes,
  sumMediaSizes,
  UserStorageUsageService,
} from './user-storage.usage.service';

describe('Pesos de fotos y videos de un anuncio', () => {
  it('sólo cuenta keys que están en imagesUrls', () => {
    const sizes = mergePostMediaSizes(
      ['a', 'bvideo'],
      [],
      [
        { key: 'a', sizeBytes: 100 },
        { key: 'bvideo', sizeBytes: 900 },
        { key: 'fantasma', sizeBytes: 5000 },
      ],
    );
    expect(sumMediaSizes(sizes)).toBe(1000);
  });

  it('al editar conserva lo anterior, suma lo nuevo y descarta lo quitado', () => {
    const sizes = mergePostMediaSizes(
      ['a', 'c'],
      [
        { key: 'a', sizeBytes: 100 },
        { key: 'b', sizeBytes: 200 },
      ],
      [{ key: 'c', sizeBytes: 300 }],
    );
    expect(sizes).toEqual([
      { key: 'a', sizeBytes: 100 },
      { key: 'c', sizeBytes: 300 },
    ]);
  });

  it('el cliente no puede reescribir el peso de un archivo ya guardado', () => {
    const sizes = mergePostMediaSizes(
      ['a'],
      [{ key: 'a', sizeBytes: 100 }],
      [{ key: 'a', sizeBytes: 1 }],
    );
    expect(sumMediaSizes(sizes)).toBe(100);
  });

  it('ignora pesos negativos o inválidos', () => {
    const sizes = mergePostMediaSizes(
      ['a', 'b'],
      [],
      [
        { key: 'a', sizeBytes: -50 },
        { key: 'b', sizeBytes: Number.NaN },
      ],
    );
    expect(sumMediaSizes(sizes)).toBe(0);
  });
});

describe('Cupo de almacenamiento', () => {
  const service = new UserStorageUsageService({} as any);

  it('deja pasar lo que entra y rechaza lo que se pasa', () => {
    expect(() => service.assertFits(1000, 400, 600)).not.toThrow();
    expect(() => service.assertFits(1000, 401, 600)).toThrow(
      'No tenés espacio suficiente',
    );
    // Sin bytes nuevos nunca rechaza (ej. quitar fotos).
    expect(() => service.assertFits(1000, 5000, 0)).not.toThrow();
  });
});
