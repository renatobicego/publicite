import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

import mapModuleTesting from './production.test.module';
import {
  ARTICLE_BLOCKS,
  cleanProductionTestData,
  findDoc,
  createTestUser,
  getProductionTestModels,
  givePlanToUser,
  ProductionTestModels,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import {
  ProductionFileType,
  ProductionItemKind,
  ProductionOwnerType,
  ProductionRole,
} from '../production/domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

// Base remota de QA: cada test hace varias idas y vueltas.
jest.setTimeout(60_000);

describe('Mis Producciones - Fase 1: núcleo del blog', () => {
  let moduleRef: TestingModule;
  let service: ProductionService;
  let models: ProductionTestModels;

  beforeAll(async () => {
    moduleRef = await mapModuleTesting.get('production')!();
    service = moduleRef.get<ProductionService>('ProductionServiceInterface');
    models = getProductionTestModels(moduleRef);
    await models.item.syncIndexes();
    await models.production.syncIndexes();
  });

  afterAll(async () => {
    await cleanProductionTestData(models);
    await moduleRef.close();
  });

  afterEach(async () => {
    delete process.env.PRODUCTION_FREE_FILES_PER_BLOG;
    await cleanProductionTestData(models);
  });

  const createBlog = async (userId: string, title = 'Mi blog') =>
    (await service.createProduction({ title }, userId))._id;

  const uploadPhoto = (
    userId: string,
    productionId: string,
    extra: { parentId?: string; fileName?: string } = {},
  ) =>
    service.uploadFile(
      {
        productionId,
        fileType: ProductionFileType.photo,
        key: 'uploadthing-key-' + Math.random(),
        ...extra,
      },
      userId,
    );

  describe('Blog (BLG-01/02/05, PLN-04)', () => {
    it('crea el blog en una transacción y lo asocia al usuario', async () => {
      const userId = await createTestUser(models);

      const productionId = await createBlog(userId, 'Fotos de Viaje 🚀');

      const production = await findDoc(models.production, productionId);
      expect(production.ownerType).toBe(ProductionOwnerType.User);
      expect(production.owner.toString()).toBe(userId);
      expect(production.creator.toString()).toBe(userId);
      expect(production.searchTitle).toBe('fotos de viaje');
      expect(production.url).toMatch(/^fotos-de-viaje-[a-f0-9]{6}$/);

      const user = await findDoc(models.user, userId);
      expect(user.productions.map(String)).toEqual([productionId]);
    });

    it('exige el nombre del blog', async () => {
      const userId = await createTestUser(models);
      await expect(
        service.createProduction({ title: '   ' }, userId),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(await models.production.countDocuments()).toBe(0);
    });

    it('bloquea un segundo blog personal (PLN-04) sin dejar datos a medias', async () => {
      const userId = await createTestUser(models);
      await createBlog(userId);

      await expect(createBlog(userId, 'Otro')).rejects.toThrow(
        'Tu plan permite un único blog personal',
      );
      expect(await models.production.countDocuments()).toBe(1);
      const user = await findDoc(models.user, userId);
      expect(user.productions).toHaveLength(1);
    });

    it('un plan pago tampoco habilita un segundo blog personal (PLN-02)', async () => {
      const userId = await createTestUser(models);
      await givePlanToUser(models, userId, {
        personalBlogsCount: 1,
        groupBlogsCount: 5,
        filesPerBlogCount: 50,
      });
      await givePlanToUser(models, userId, {
        personalBlogsCount: 1,
        groupBlogsCount: 5,
        filesPerBlogCount: 50,
      });
      await createBlog(userId);
      await expect(createBlog(userId, 'Otro')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('sólo el dueño edita el blog (BLG-05) y la edición actualiza la búsqueda', async () => {
      const ownerId = await createTestUser(models);
      const otherId = await createTestUser(models);
      const productionId = await createBlog(ownerId);

      await expect(
        service.updateProduction(productionId, { title: 'Hackeado' }, otherId),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const updated = await service.updateProduction(
        productionId,
        {
          title: 'Nuevo Título',
          description: 'Descripción Única',
          shelf: [
            {
              category: 'books' as any,
              title: 'Rayuela',
              link: 'https://example.com/rayuela',
            },
          ],
        },
        ownerId,
      );
      expect(updated.title).toBe('Nuevo Título');
      expect(updated.viewer.role).toBe(ProductionRole.admin);
      expect(updated.shelf).toHaveLength(1);

      const stored = await findDoc(models.production, productionId);
      expect(stored.searchTitle).toBe('nuevo titulo');
      expect(stored.searchDescription).toBe('descripcion unica');
    });

    it('el muestrario sólo acepta archivos o artículos del blog (BLG-04)', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);
      const folder = await service.createFolder(
        { productionId, name: 'Carpeta' },
        userId,
      );
      const photo = await uploadPhoto(userId, productionId);

      await expect(
        service.updateProduction(productionId, { showcase: [folder._id] }, userId),
      ).rejects.toBeInstanceOf(BadRequestException);

      const updated = await service.updateProduction(
        productionId,
        { showcase: [photo._id] },
        userId,
      );
      expect(updated.showcase).toEqual([photo._id]);
    });

    it('un usuario sin sesión no puede crear ni editar', async () => {
      const ownerId = await createTestUser(models);
      const productionId = await createBlog(ownerId);
      await expect(
        service.updateProduction(productionId, { title: 'x' }, undefined as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('Archivos y cupo (BLG-12/13, PLN-05, RNF-06)', () => {
    it('genera el ID del archivo y cuenta el cupo', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);

      const first = await uploadPhoto(userId, productionId);
      const second = await uploadPhoto(userId, productionId);

      expect(first.fileName).toBe('archivo-1');
      expect(second.fileName).toBe('archivo-2');
      expect(first.key).toBeTruthy();
      const production = await findDoc(models.production, productionId);
      expect(production.filesCount).toBe(2);
    });

    it('el ID del archivo es único en su carpeta (BLG-13)', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);
      await uploadPhoto(userId, productionId, { fileName: 'FOTO-01' });

      await expect(
        uploadPhoto(userId, productionId, { fileName: 'FOTO-01' }),
      ).rejects.toBeInstanceOf(BadRequestException);

      // El intento fallido no consume cupo.
      const production = await findDoc(models.production, productionId);
      expect(production.filesCount).toBe(1);

      // En otra carpeta el mismo ID es válido.
      const folder = await service.createFolder(
        { productionId, name: 'Otra carpeta' },
        userId,
      );
      const inFolder = await uploadPhoto(userId, productionId, {
        fileName: 'FOTO-01',
        parentId: folder._id,
      });
      expect(inFolder.fileName).toBe('FOTO-01');
    });

    it('bloquea al llegar al cupo y lo libera al borrar (PLN-05, BLG-06)', async () => {
      process.env.PRODUCTION_FREE_FILES_PER_BLOG = '2';
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);

      const first = await uploadPhoto(userId, productionId);
      await uploadPhoto(userId, productionId);
      await expect(uploadPhoto(userId, productionId)).rejects.toThrow(
        'Alcanzaste el límite de 2 archivos',
      );

      await service.deleteItem(first._id, ProductionItemKind.file, userId);
      const production = await findDoc(models.production, productionId);
      expect(production.filesCount).toBe(1);

      await expect(uploadPhoto(userId, productionId)).resolves.toBeDefined();
    });

    it('el cupo sale del plan del usuario', async () => {
      const userId = await createTestUser(models);
      await givePlanToUser(models, userId, { filesPerBlogCount: 3 });
      const productionId = await createBlog(userId);

      for (let i = 0; i < 3; i++) await uploadPhoto(userId, productionId);
      await expect(uploadPhoto(userId, productionId)).rejects.toThrow(
        'Alcanzaste el límite de 3 archivos',
      );
    });

    it('subidas concurrentes no superan el cupo', async () => {
      process.env.PRODUCTION_FREE_FILES_PER_BLOG = '2';
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);

      const results = await Promise.allSettled(
        Array.from({ length: 5 }, () => uploadPhoto(userId, productionId)),
      );

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(2);
      expect(
        await models.item.countDocuments({ kind: ProductionItemKind.file }),
      ).toBe(2);
      const production = await findDoc(models.production, productionId);
      expect(production.filesCount).toBe(2);
    });

    it('sólo el dueño sube, edita y borra archivos', async () => {
      const ownerId = await createTestUser(models);
      const otherId = await createTestUser(models);
      const productionId = await createBlog(ownerId);
      const photo = await uploadPhoto(ownerId, productionId);

      await expect(uploadPhoto(otherId, productionId)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(
        service.updateFile(photo._id, { name: 'x' }, otherId),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        service.deleteItem(photo._id, ProductionItemKind.file, otherId),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('guarda el dorso de la postal y permite editarlo (BLG-08)', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);
      const photo = await service.uploadFile(
        {
          productionId,
          fileType: ProductionFileType.photo,
          key: 'key-postal',
          name: 'Atardecer',
          postcard: {
            latitude: -34.6,
            longitude: -58.4,
            authorship: 'Ana',
            dedication: 'Para vos',
            description: 'Me sentí en paz',
          },
        },
        userId,
      );
      expect(photo.postcard?.dedication).toBe('Para vos');

      const updated = await service.updateFile(
        photo._id,
        { fileName: 'POSTAL-1', postcard: { authorship: 'Beto' } },
        userId,
      );
      expect(updated.fileName).toBe('POSTAL-1');
      expect(updated.postcard?.authorship).toBe('Beto');
    });
  });

  describe('Artículos (BLG-14..17)', () => {
    it('crea y edita un artículo con bloques y cuenta para el cupo', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);

      const article = await service.createArticle(
        { productionId, title: 'Mi viaje', blocks: ARTICLE_BLOCKS },
        userId,
      );
      expect(article.kind).toBe(ProductionItemKind.article);
      expect(article.fileName).toBe('articulo-1');
      expect(article.blocks).toHaveLength(2);
      expect(JSON.parse(article.blocks![0].data).text).toBe('Hola');

      const updated = await service.updateArticle(
        article._id,
        { title: 'Mi viaje (editado)', blocks: [ARTICLE_BLOCKS[1]] },
        userId,
      );
      expect(updated.name).toBe('Mi viaje (editado)');
      expect(updated.blocks).toHaveLength(1);

      const production = await findDoc(models.production, productionId);
      expect(production.filesCount).toBe(1);
    });
  });

  describe('Árbol de carpetas y hard delete (BLG-06/07, RNF-05)', () => {
    it('lista cada nivel con carpetas primero y breadcrumb', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);
      const root = await service.createFolder({ productionId, name: 'Viajes' }, userId);
      const sub = await service.createFolder(
        { productionId, name: 'Europa', parentId: root._id },
        userId,
      );
      await uploadPhoto(userId, productionId, { parentId: sub._id });
      await uploadPhoto(userId, productionId);

      const rootLevel = await service.getProductionItems(
        productionId,
        undefined,
        userId,
      );
      expect(rootLevel.items.map((i) => i.kind)).toEqual([
        ProductionItemKind.folder,
        ProductionItemKind.file,
      ]);
      expect(rootLevel.breadcrumb).toEqual([]);

      const subLevel = await service.getProductionItems(
        productionId,
        sub._id,
        userId,
      );
      expect(subLevel.items).toHaveLength(1);
      expect(subLevel.parent?._id).toBe(sub._id);
      expect(subLevel.breadcrumb.map((b) => b.name)).toEqual(['Viajes', 'Europa']);
    });

    it('rechaza una carpeta padre de otro blog o que no es carpeta', async () => {
      const userId = await createTestUser(models);
      const otherUserId = await createTestUser(models);
      const productionId = await createBlog(userId);
      const otherProductionId = await createBlog(otherUserId);
      const foreignFolder = await service.createFolder(
        { productionId: otherProductionId, name: 'Ajena' },
        otherUserId,
      );
      const photo = await uploadPhoto(userId, productionId);

      await expect(
        uploadPhoto(userId, productionId, { parentId: foreignFolder._id }),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.createFolder(
          { productionId, name: 'x', parentId: photo._id },
          userId,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('borrar una carpeta borra su subárbol y libera el cupo', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);
      const root = await service.createFolder({ productionId, name: 'A' }, userId);
      const sub = await service.createFolder(
        { productionId, name: 'B', parentId: root._id },
        userId,
      );
      const deep = await uploadPhoto(userId, productionId, { parentId: sub._id });
      await service.createArticle(
        { productionId, title: 'Art', blocks: ARTICLE_BLOCKS, parentId: root._id },
        userId,
      );
      const outside = await uploadPhoto(userId, productionId);
      await service.updateProduction(
        productionId,
        { showcase: [deep._id, outside._id] },
        userId,
      );

      await service.deleteItem(root._id, ProductionItemKind.folder, userId);

      expect(await models.item.countDocuments({ production: productionId })).toBe(1);
      const production = await findDoc(models.production, productionId);
      expect(production.filesCount).toBe(1);
      expect(production.showcase.map(String)).toEqual([outside._id]);
    });

    it('deleteFile no borra una carpeta (el tipo tiene que coincidir)', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);
      const folder = await service.createFolder({ productionId, name: 'A' }, userId);
      await expect(
        service.deleteItem(folder._id, ProductionItemKind.file, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('borrar el blog borra todo y libera el cupo de blogs', async () => {
      const userId = await createTestUser(models);
      const productionId = await createBlog(userId);
      const folder = await service.createFolder({ productionId, name: 'A' }, userId);
      await uploadPhoto(userId, productionId, { parentId: folder._id });

      await service.deleteProduction(productionId, userId);

      expect(await models.production.countDocuments()).toBe(0);
      expect(await models.item.countDocuments()).toBe(0);
      const user = await findDoc(models.user, userId);
      expect(user.productions).toHaveLength(0);
      await expect(createBlog(userId, 'De nuevo')).resolves.toBeDefined();
    });
  });

  describe('Lectura para visitantes', () => {
    it('un visitante ve el blog público, sin datos de staff', async () => {
      const ownerId = await createTestUser(models);
      const visitorId = await createTestUser(models);
      const productionId = await createBlog(ownerId);
      await service.updateProduction(productionId, { title: 'Público' }, ownerId);

      const asVisitor = await service.findProductionById(productionId, visitorId);
      expect(asVisitor.viewer.role).toBe(ProductionRole.visitor);
      expect(asVisitor.viewer.canEdit).toBe(false);
      expect(asVisitor.filesPerBlogLimit).toBeNull();
      expect(asVisitor.moderationStatus).toBeNull();
      expect(asVisitor.ownerInfo?._id).toBe(ownerId);

      const anonymous = await service.findProductionById(productionId);
      expect(anonymous.viewer.canViewContent).toBe(true);

      const asOwner = await service.findProductionById(productionId, ownerId);
      expect(asOwner.filesPerBlogLimit).toBe(10);
    });

    it('un blog sólo para registrados no se muestra sin sesión', async () => {
      const ownerId = await createTestUser(models);
      const visitorId = await createTestUser(models);
      const { _id: productionId } = await service.createProduction(
        { title: 'Privado', visibility: Visibility.registered },
        ownerId,
      );

      await expect(service.findProductionById(productionId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(
        service.findProductionById(productionId, visitorId),
      ).resolves.toBeDefined();
    });

    it('la URL autogenerada encuentra el blog', async () => {
      const ownerId = await createTestUser(models);
      const productionId = await createBlog(ownerId, 'Buscame por URL');
      const { url } = await findDoc(models.production, productionId);

      const found = await service.findProductionByUrl(url);
      expect(found._id).toBe(productionId);
    });

    it('lista los blogs del dueño para su cartel (NAV-04)', async () => {
      const ownerId = await createTestUser(models);
      const productionId = await createBlog(ownerId);

      const list = await service.findProductionsByOwner(ownerId, undefined);
      expect(list.map((p) => p._id)).toEqual([productionId]);
    });

    it('expone los límites del usuario', async () => {
      const userId = await createTestUser(models);
      await createBlog(userId);
      const limits = await service.getProductionLimits(userId);
      expect(limits).toMatchObject({
        personalBlogCount: 1,
        personalBlogsAvailable: 0,
        groupBlogsAvailable: 1,
        filesPerBlogLimit: 10,
        canSellPaidTickets: false,
      });
    });
  });
});
