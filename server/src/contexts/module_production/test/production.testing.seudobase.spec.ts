import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

import mapModuleTesting from './production.test.module';
import {
  cleanProductionTestData,
  createTestGroup,
  createTestUser,
  findDoc,
  getProductionTestModels,
  givePlanToUser,
  ProductionTestModels,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import { ProductionTicketService } from '../production/application/service/production.ticket.service';
import { ProductionSeudoBaseService } from '../production/application/service/production.seudobase.service';
import {
  ProductionFileType,
  ProductionItemKind,
} from '../production/domain/entity/enum/production.enums';
import {
  ProductionBulkAction,
  ProductionPriceChangeMode,
} from '../production/domain/entity/enum/production-seudobase.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

// Base remota de QA: cada test hace varias idas y vueltas.
jest.setTimeout(60_000);

describe('Mis Producciones - Fase 7: SeudoBase y gestión masiva (SB-01..05)', () => {
  let moduleRef: TestingModule;
  let service: ProductionService;
  let tickets: ProductionTicketService;
  let seudoBase: ProductionSeudoBaseService;
  let models: ProductionTestModels;

  beforeAll(async () => {
    moduleRef = await mapModuleTesting.get('production')!();
    service = moduleRef.get<ProductionService>('ProductionServiceInterface');
    tickets = moduleRef.get<ProductionTicketService>(
      'ProductionTicketServiceInterface',
    );
    seudoBase = moduleRef.get<ProductionSeudoBaseService>(
      'ProductionSeudoBaseServiceInterface',
    );
    models = getProductionTestModels(moduleRef);
  });

  afterAll(async () => {
    await cleanProductionTestData(models);
    await moduleRef.close();
  });

  afterEach(async () => {
    await cleanProductionTestData(models);
  });

  /** Blog con carpeta "Álbum" (ticket 1000), dos fotos (una con ticket 500) y un artículo. */
  const setup = async () => {
    const owner = await createTestUser(models);
    await givePlanToUser(models, owner, { isFree: false, filesPerBlogCount: 50 });
    const { _id: productionId } = await service.createProduction(
      { title: 'Blog SeudoBase' },
      owner,
    );
    await tickets.setProductionPayoutAlias(productionId, 'creador.alias', owner);
    const album = await service.createFolder(
      { productionId, name: 'Álbum', visibility: Visibility.registered },
      owner,
    );
    const photoA = await service.uploadFile(
      {
        productionId,
        parentId: album._id,
        fileType: ProductionFileType.photo,
        key: 'key-a',
        fileName: 'FOTO-A',
        name: 'Atardecer',
      },
      owner,
    );
    const photoB = await service.uploadFile(
      {
        productionId,
        parentId: album._id,
        fileType: ProductionFileType.photo,
        key: 'key-b',
        fileName: 'FOTO-B',
        name: 'Montaña',
      },
      owner,
    );
    const article = await service.createArticle(
      { productionId, title: 'Crónica', blocks: [] },
      owner,
    );
    await tickets.createProductionTicket(
      { productionId, targetId: album._id, isPaid: true, price: 1000, untilClose: true },
      owner,
    );
    await tickets.createProductionTicket(
      { productionId, targetId: photoB._id, isPaid: true, price: 500, untilClose: true },
      owner,
    );
    return { owner, productionId, album, photoA, photoB, article };
  };

  describe('Vista tipo Excel (SB-01)', () => {
    it('lista con foto, Nº, título, precio y alcance efectivos', async () => {
      const { owner, productionId, photoA, photoB } = await setup();

      const { rows, total } = await seudoBase.getProductionSeudoBase(
        productionId,
        owner,
        { kinds: [ProductionItemKind.file] },
        1,
        20,
      );
      expect(total).toBe(2);
      const byId = new Map(rows.map((row) => [row._id, row]));

      expect(byId.get(photoA._id)).toMatchObject({
        fileName: 'FOTO-A',
        name: 'Atardecer',
        key: 'key-a',
        path: 'Álbum',
        price: 1000,
        ownTicket: null,
        effectiveVisibility: Visibility.registered,
      });
      expect(byId.get(photoB._id)).toMatchObject({
        price: 500,
        ownTicket: expect.objectContaining({ price: 500 }),
      });
    });

    it('busca por título o por Nº', async () => {
      const { owner, productionId, photoB } = await setup();
      const byTitle = await seudoBase.getProductionSeudoBase(
        productionId,
        owner,
        { searchTerm: 'montaña' },
        1,
        20,
      );
      expect(byTitle.rows.map((r) => r._id)).toEqual([photoB._id]);

      const byNumber = await seudoBase.getProductionSeudoBase(
        productionId,
        owner,
        { searchTerm: 'FOTO-B' },
        1,
        20,
      );
      expect(byNumber.rows.map((r) => r._id)).toEqual([photoB._id]);
    });

    it('es sólo para el staff del blog', async () => {
      const { productionId } = await setup();
      const visitor = await createTestUser(models);
      await expect(
        seudoBase.getProductionSeudoBase(productionId, visitor, undefined, 1, 20),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('Operaciones masivas (SB-02/03)', () => {
    it('exige confirmación explícita y que los ítems sean del blog', async () => {
      const { owner, productionId, photoA } = await setup();
      const other = await createTestUser(models);
      const { _id: otherProduction } = await service.createProduction(
        { title: 'Otro' },
        other,
      );
      const foreign = await service.uploadFile(
        { productionId: otherProduction, fileType: ProductionFileType.photo, key: 'x' },
        other,
      );

      await expect(
        seudoBase.bulkDeleteProductionItems(
          { productionId, itemIds: [photoA._id], confirm: false },
          owner,
        ),
      ).rejects.toThrow('Confirmá la operación masiva');
      await expect(
        seudoBase.bulkDeleteProductionItems(
          { productionId, itemIds: [photoA._id, foreign._id], confirm: true },
          owner,
        ),
      ).rejects.toThrow('no pertenecen a este blog');
      expect(await models.item.countDocuments({ production: productionId })).toBe(4);
    });

    it('sube precios un 5% sólo donde hay ticket pago propio, y lo audita', async () => {
      const { owner, productionId, album, photoA, photoB } = await setup();

      const result = await seudoBase.bulkUpdateProductionPrices(
        {
          productionId,
          itemIds: [album._id, photoA._id, photoB._id],
          mode: ProductionPriceChangeMode.percentage,
          value: 5,
          confirm: true,
        },
        owner,
      );
      expect(result).toMatchObject({
        action: ProductionBulkAction.price,
        requested: 3,
        affected: 2,
        skipped: [photoA._id],
      });

      const list = await tickets.getProductionTickets(productionId, owner);
      expect(list.map((t) => t.price).sort((a, b) => a - b)).toEqual([525, 1050]);

      const audit = await seudoBase.getProductionAuditLog(productionId, owner, 1, 10);
      expect(audit.total).toBe(1);
      expect(audit.entries[0]).toMatchObject({
        _id: result.auditId,
        action: ProductionBulkAction.price,
        actor: owner,
        affectedCount: 2,
      });
      const details = JSON.parse(audit.entries[0].details);
      expect(details.changes).toEqual(
        expect.arrayContaining([
          { itemId: album._id, before: 1000, after: 1050 },
          { itemId: photoB._id, before: 500, after: 525 },
        ]),
      );
    });

    it('fija un precio y rechaza precios resultantes inválidos', async () => {
      const { owner, productionId, photoB } = await setup();
      await seudoBase.bulkUpdateProductionPrices(
        {
          productionId,
          itemIds: [photoB._id],
          mode: ProductionPriceChangeMode.fixed,
          value: 750,
          confirm: true,
        },
        owner,
      );
      const detail = await service.getProductionItemById(photoB._id, owner);
      expect(detail._id).toBe(photoB._id);
      const list = await tickets.getProductionTickets(productionId, owner);
      expect(list.find((t) => t.target === photoB._id)!.price).toBe(750);

      await expect(
        seudoBase.bulkUpdateProductionPrices(
          {
            productionId,
            itemIds: [photoB._id],
            mode: ProductionPriceChangeMode.fixed,
            value: 0,
            confirm: true,
          },
          owner,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        seudoBase.bulkUpdateProductionPrices(
          {
            productionId,
            itemIds: [photoB._id],
            mode: ProductionPriceChangeMode.percentage,
            value: -100,
            confirm: true,
          },
          owner,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect((await seudoBase.getProductionAuditLog(productionId, owner, 1, 10)).total).toBe(1);
    });

    it('cambia la visibilidad en lote y puede volver a heredar', async () => {
      const { owner, productionId, photoA, article } = await setup();

      await seudoBase.bulkUpdateProductionVisibility(
        {
          productionId,
          itemIds: [photoA._id, article._id],
          visibility: Visibility.friends,
          confirm: true,
        },
        owner,
      );
      expect((await findDoc(models.item, photoA._id)).visibility).toBe(Visibility.friends);
      expect((await findDoc(models.item, article._id)).visibility).toBe(Visibility.friends);

      await seudoBase.bulkUpdateProductionVisibility(
        { productionId, itemIds: [photoA._id], visibility: null, confirm: true },
        owner,
      );
      expect((await findDoc(models.item, photoA._id)).visibility).toBeNull();
    });

    it('borra en lote con hard delete, libera cupo y audita', async () => {
      const { owner, productionId, album, article } = await setup();

      const result = await seudoBase.bulkDeleteProductionItems(
        { productionId, itemIds: [album._id, article._id], confirm: true },
        owner,
      );
      expect(result).toMatchObject({ requested: 2, affected: 2 });

      expect(await models.item.countDocuments({ production: productionId })).toBe(0);
      expect((await findDoc(models.production, productionId)).filesCount).toBe(0);
      expect(await tickets.getProductionTickets(productionId, owner)).toEqual([]);

      const [entry] = (await seudoBase.getProductionAuditLog(productionId, owner, 1, 10))
        .entries;
      const details = JSON.parse(entry.details);
      expect(details.deletedNodes).toBe(4);
      expect(details.freedQuota).toBe(3);
    });

    it('un moderador del grupo también opera la SeudoBase; un miembro no', async () => {
      const creator = await createTestUser(models);
      const moderator = await createTestUser(models);
      const member = await createTestUser(models);
      const groupId = await createTestGroup(models, {
        creator,
        admins: [moderator],
        members: [member],
      });
      const { _id: productionId } = await service.createProduction(
        { title: 'Grupo', groupId },
        creator,
      );
      const photo = await service.uploadFile(
        { productionId, fileType: ProductionFileType.photo, key: 'k' },
        creator,
      );

      await expect(
        seudoBase.bulkDeleteProductionItems(
          { productionId, itemIds: [photo._id], confirm: true },
          member,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        seudoBase.bulkDeleteProductionItems(
          { productionId, itemIds: [photo._id], confirm: true },
          moderator,
        ),
      ).resolves.toMatchObject({ affected: 1 });
    });

    it('borrar el blog borra su auditoría', async () => {
      const { owner, productionId, photoA } = await setup();
      await seudoBase.bulkUpdateProductionVisibility(
        { productionId, itemIds: [photoA._id], visibility: null, confirm: true },
        owner,
      );
      await service.deleteProduction(productionId, owner);
      expect(
        await models.connection.collection('productionauditlogs').countDocuments(),
      ).toBe(0);
    });
  });
});
