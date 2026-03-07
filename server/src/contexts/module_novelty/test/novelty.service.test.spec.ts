import { NoveltyService } from '../novelty/application/service/novelty.service';
import { NoveltyRepositoryInterface } from '../novelty/domain/repository/novelty.repository.interface';
import { NoveltyRequest } from '../novelty/application/adapter/dto/HTTP-REQUEST/novelty.request';
import { NoveltyUpdateRequest } from '../novelty/application/adapter/dto/HTTP-REQUEST/novelty.update.request';
import { NoveltyResponse } from '../novelty/application/adapter/dto/HTTP-RESPONSE/novelty.response';

describe('NoveltyService', () => {
  let noveltyService: NoveltyService;
  let noveltyRepositoryMock: jest.Mocked<NoveltyRepositoryInterface>;
  let loggerMock: {
    log: jest.Mock;
    error: jest.Mock;
  };

  beforeEach(() => {
    noveltyRepositoryMock = {
      createNovelty: jest.fn(),
      getNoveltyById: jest.fn(),
      getAllNovelties: jest.fn(),
      updateNoveltyById: jest.fn(),
      deleteNoveltyById: jest.fn(),
    };

    loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
    };

    noveltyService = new NoveltyService(
      loggerMock as any,
      noveltyRepositoryMock as any,
    );
  });

  it('creates novelty with dynamic properties and blocks', async () => {
    const noveltyRequest: NoveltyRequest = {
      properties: [
        { key: 'fecha', value: '2026-03-07' },
        { key: 'autor', value: 'admin' },
      ],
      blocks: [
        { type: 'header', data: '{"text":"Titulo","level":2}' },
        { type: 'paragraph', data: '{"text":"Contenido"}' },
      ],
    };

    const noveltyCreated = new NoveltyResponse({
      _id: '67cb00000000000000000001',
      properties: noveltyRequest.properties,
      blocks: noveltyRequest.blocks,
      createdAt: new Date('2026-03-07T10:00:00.000Z'),
      updatedAt: new Date('2026-03-07T10:00:00.000Z'),
    });

    noveltyRepositoryMock.createNovelty.mockResolvedValue(noveltyCreated);

    const result = await noveltyService.createNovelty(noveltyRequest);

    expect(result._id).toBe('67cb00000000000000000001');
    expect(result.properties).toEqual(noveltyRequest.properties);
    expect(result.blocks).toEqual(noveltyRequest.blocks);
    expect(noveltyRepositoryMock.createNovelty).toHaveBeenCalledTimes(1);
    expect(noveltyRepositoryMock.createNovelty).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: noveltyRequest.properties,
        blocks: noveltyRequest.blocks,
      }),
    );
  });

  it('updates novelty by id', async () => {
    const noveltyUpdateRequest: NoveltyUpdateRequest = {
      _id: '67cb00000000000000000001',
      properties: [{ key: 'autor', value: 'editor' }],
      blocks: [{ type: 'paragraph', data: '{"text":"Actualizado"}' }],
    };

    noveltyRepositoryMock.updateNoveltyById.mockResolvedValue(
      noveltyUpdateRequest._id,
    );

    const result = await noveltyService.updateNoveltyById(noveltyUpdateRequest);

    expect(result).toBe(noveltyUpdateRequest._id);
    expect(noveltyRepositoryMock.updateNoveltyById).toHaveBeenCalledWith(
      noveltyUpdateRequest,
    );
  });
});
