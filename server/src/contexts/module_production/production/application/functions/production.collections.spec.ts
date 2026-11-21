import { afterEach, describe, expect, it, jest } from '@jest/globals';

import {
  ProductionFolder,
  ProductionItem,
} from '../../domain/entity/production-item.entity';
import {
  ProductionCollectionType,
  ProductionItemKind,
} from '../../domain/entity/enum/production.enums';
import { fetchUploadedFileSize } from 'src/contexts/module_shared/storage/uploaded-file-size';

const base = {
  production: '64b000000000000000000001',
  name: 'Mi carpeta',
  createdBy: '64b000000000000000000002',
};

describe('Colecciones: carpetas con tipo y Love It', () => {
  it('una carpeta sin tipo es común y no tiene Love It', () => {
    const folder = new ProductionFolder({ ...base, loveItEnabled: true });
    expect(folder.getCollectionType).toBeNull();
    expect(folder.isLoveItEnabled).toBe(false);
  });

  it('Love It sólo queda prendido en un álbum', () => {
    const album = new ProductionFolder({
      ...base,
      collectionType: ProductionCollectionType.album,
      loveItEnabled: true,
    });
    const movie = new ProductionFolder({
      ...base,
      collectionType: ProductionCollectionType.movie,
      loveItEnabled: true,
    });
    expect(album.isLoveItEnabled).toBe(true);
    expect(movie.isLoveItEnabled).toBe(false);
  });

  it('lee los campos de colección de un documento (y las carpetas viejas sin ellos)', () => {
    const folder = ProductionItem.fromDocument({
      _id: '64b000000000000000000003',
      ...base,
      kind: ProductionItemKind.folder,
      collectionType: ProductionCollectionType.series,
      description: 'Temporada 1',
      coverItem: '64b000000000000000000004',
    }) as ProductionFolder;
    expect(folder.getCollectionType).toBe(ProductionCollectionType.series);
    expect(folder.getDescription).toBe('Temporada 1');
    expect(folder.getCoverItem).toBe('64b000000000000000000004');

    const legacy = ProductionItem.fromDocument({
      _id: '64b000000000000000000005',
      ...base,
      kind: ProductionItemKind.folder,
    }) as ProductionFolder;
    expect(legacy.getCollectionType).toBeNull();
    expect(legacy.isLoveItEnabled).toBe(false);
    expect(legacy.getCoverItem).toBeNull();
  });
});

describe('Peso real de un archivo subido (HEAD al CDN)', () => {
  const previous = process.env.UPLOADTHING_FILE_URL;
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    if (previous === undefined) delete process.env.UPLOADTHING_FILE_URL;
    else process.env.UPLOADTHING_FILE_URL = previous;
  });

  it('sin la URL configurada no consulta y devuelve null', async () => {
    delete process.env.UPLOADTHING_FILE_URL;
    const fetchMock = jest.fn();
    global.fetch = fetchMock as any;
    await expect(fetchUploadedFileSize('abc')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('usa el content-length y le saca el sufijo "video" al key', async () => {
    process.env.UPLOADTHING_FILE_URL = 'https://cdn.test/f/';
    const fetchMock = jest.fn(async () => ({
      ok: true,
      headers: { get: () => '8589934592' },
    }));
    global.fetch = fetchMock as any;
    await expect(fetchUploadedFileSize('abcvideo')).resolves.toBe(8589934592);
    expect((fetchMock.mock.calls[0] as any[])[0]).toBe('https://cdn.test/f/abc');
  });

  it('si el CDN falla devuelve null (se usa el tamaño del cliente)', async () => {
    process.env.UPLOADTHING_FILE_URL = 'https://cdn.test/f/';
    global.fetch = jest.fn(async () => {
      throw new Error('offline');
    }) as any;
    await expect(fetchUploadedFileSize('abc')).resolves.toBeNull();
  });
});
