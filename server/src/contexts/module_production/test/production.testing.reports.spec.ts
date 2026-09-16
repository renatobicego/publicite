import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

import mapModuleTesting from './production.test.module';
import {
  cleanProductionTestData,
  createTestUser,
  getProductionTestModels,
  ProductionTestModels,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import { ProductionModerationService } from '../production/application/service/production.moderation.service';
import {
  ProductionFileType,
  ProductionItemKind,
  ProductionModerationStatus,
} from '../production/domain/entity/enum/production.enums';
import {
  ProductionModerationAction,
  ProductionReportReason,
  ProductionReportStatus,
} from '../production/domain/entity/enum/production-report.enums';

// Base remota de QA: cada test hace varias idas y vueltas.
jest.setTimeout(60_000);

describe('Mis Producciones - Fase 9: denuncias (DEN-01..03)', () => {
  let moduleRef: TestingModule;
  let service: ProductionService;
  let moderation: ProductionModerationService;
  let models: ProductionTestModels;

  beforeAll(async () => {
    process.env.PRODUCTION_REPORTS_HIDE_THRESHOLD = '2';
    moduleRef = await mapModuleTesting.get('production')!();
    service = moduleRef.get<ProductionService>('ProductionServiceInterface');
    moderation = moduleRef.get<ProductionModerationService>(
      'ProductionModerationServiceInterface',
    );
    models = getProductionTestModels(moduleRef);
    await models.connection
      .collection('productionreports')
      .createIndex(
        { production: 1, item: 1, reporter: 1 },
        {
          unique: true,
          partialFilterExpression: { status: ProductionReportStatus.pending },
          name: 'unique_pending_report_per_reporter',
        },
      )
      .catch(() => undefined);
  });

  afterAll(async () => {
    delete process.env.PRODUCTION_REPORTS_HIDE_THRESHOLD;
    await cleanProductionTestData(models);
    await moduleRef.close();
  });

  afterEach(async () => {
    await cleanProductionTestData(models);
  });

  /** Blog con una carpeta que contiene una foto. */
  const setup = async () => {
    const owner = await createTestUser(models);
    const { _id: productionId } = await service.createProduction(
      { title: 'Blog denunciable' },
      owner,
    );
    const folder = await service.createFolder(
      { productionId, name: 'Carpeta' },
      owner,
    );
    const photo = await service.uploadFile(
      {
        productionId,
        parentId: folder._id,
        fileType: ProductionFileType.photo,
        key: 'key-foto',
      },
      owner,
    );
    return { owner, productionId, folder, photo };
  };

  const report = (
    userId: string,
    productionId: string,
    itemId?: string,
    reason = ProductionReportReason.inappropriate,
  ) =>
    moderation.reportProductionContent(
      { productionId, itemId, reason, details: 'Detalle' },
      userId,
    );

  it('registra la denuncia una vez por usuario y no deja denunciar lo propio (DEN-01)', async () => {
    const { owner, productionId, photo } = await setup();
    const reporter = await createTestUser(models);

    const created = await report(reporter, productionId, photo._id);
    expect(created).toMatchObject({
      item: photo._id,
      status: ProductionReportStatus.pending,
      contentHidden: false,
    });
    await expect(report(reporter, productionId, photo._id)).rejects.toThrow(
      'Ya denunciaste',
    );
    await expect(report(owner, productionId, photo._id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      report(reporter, productionId, '64b000000000000000000000'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('al llegar al umbral oculta el contenido y su subárbol (DEN-02)', async () => {
    const { owner, productionId, folder, photo } = await setup();
    const first = await createTestUser(models);
    const second = await createTestUser(models);
    const visitor = await createTestUser(models);

    await report(first, productionId, folder._id);
    const hidden = await report(second, productionId, folder._id, ProductionReportReason.spam);
    expect(hidden.contentHidden).toBe(true);

    // Los visitantes ya no ven la carpeta ni lo que contiene.
    const root = await service.getProductionItems(productionId, undefined, visitor);
    expect(root.items).toHaveLength(0);
    await expect(
      service.getProductionItemById(photo._id, visitor),
    ).rejects.toBeInstanceOf(NotFoundException);

    // El staff lo sigue viendo, marcado.
    const asOwner = await service.getProductionItems(productionId, undefined, owner);
    expect(asOwner.items[0].moderationStatus).toBe(ProductionModerationStatus.hidden);

    // Queda para revisión del admin.
    const targets = await moderation.getProductionReportTargetsAdmin(
      ProductionReportStatus.pending,
      1,
      10,
    );
    expect(targets.total).toBe(1);
    expect(targets.targets[0]).toMatchObject({
      production: productionId,
      productionTitle: 'Blog denunciable',
      item: folder._id,
      itemName: 'Carpeta',
      itemKind: ProductionItemKind.folder,
      moderationStatus: ProductionModerationStatus.hidden,
      reports: 2,
    });
    expect(targets.targets[0].reasons.sort()).toEqual(
      [ProductionReportReason.inappropriate, ProductionReportReason.spam].sort(),
    );
    expect(targets.targets[0].ownerInfo?._id).toBe(owner);

    const details = await moderation.getProductionTargetReportsAdmin(
      productionId,
      folder._id,
    );
    expect(details).toHaveLength(2);
    expect(details[0].reporterInfo?.email).toBeTruthy();
  });

  it('el admin restaura el contenido y descarta las denuncias (DEN-03)', async () => {
    const { productionId, photo } = await setup();
    const first = await createTestUser(models);
    const second = await createTestUser(models);
    const admin = await createTestUser(models);
    await report(first, productionId, photo._id);
    await report(second, productionId, photo._id);

    const result = await moderation.moderateProductionContent(
      {
        productionId,
        itemId: photo._id,
        action: ProductionModerationAction.restore,
        note: 'No infringe',
      },
      admin,
    );
    expect(result).toMatchObject({
      moderationStatus: ProductionModerationStatus.active,
      resolvedReports: 2,
    });

    const visible = await service.getProductionItemById(photo._id, first);
    expect(visible.key).toBe('key-foto');
    const dismissed = await moderation.getProductionTargetReportsAdmin(
      productionId,
      photo._id,
    );
    expect(dismissed.every((r) => r.status === ProductionReportStatus.dismissed)).toBe(
      true,
    );
    expect(dismissed[0]).toMatchObject({ reviewedBy: admin, reviewNote: 'No infringe' });
    expect(
      (await moderation.getProductionReportTargetsAdmin(ProductionReportStatus.pending, 1, 10))
        .total,
    ).toBe(0);

    // Después de la revisión se puede volver a denunciar.
    await expect(report(first, productionId, photo._id)).resolves.toBeDefined();
  });

  it('el admin confirma el bloqueo y el contenido deja de estar disponible', async () => {
    const { owner, productionId, photo } = await setup();
    const reporter = await createTestUser(models);
    const admin = await createTestUser(models);
    await report(reporter, productionId, photo._id);

    const result = await moderation.moderateProductionContent(
      { productionId, itemId: photo._id, action: ProductionModerationAction.block },
      admin,
    );
    expect(result).toMatchObject({
      moderationStatus: ProductionModerationStatus.blocked,
      resolvedReports: 1,
    });

    await expect(
      service.getProductionItemById(photo._id, reporter),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(report(reporter, productionId, photo._id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    const asOwner = await service.getProductionItemById(photo._id, owner);
    expect(asOwner.moderationStatus).toBe(ProductionModerationStatus.blocked);

    const upheld = await moderation.getProductionReportTargetsAdmin(
      ProductionReportStatus.upheld,
      1,
      10,
    );
    expect(upheld.targets[0]).toMatchObject({
      item: photo._id,
      moderationStatus: ProductionModerationStatus.blocked,
    });
  });

  it('las denuncias al blog lo ocultan de los listados', async () => {
    const { owner, productionId } = await setup();
    const first = await createTestUser(models);
    const second = await createTestUser(models);

    await report(first, productionId);
    const hidden = await report(second, productionId);
    expect(hidden.contentHidden).toBe(true);

    expect((await service.findAllProductions(1, 10)).productions).toHaveLength(0);
    await expect(
      service.findProductionById(productionId, first),
    ).rejects.toBeInstanceOf(NotFoundException);
    const asOwner = await service.findProductionById(productionId, owner);
    expect(asOwner.moderationStatus).toBe(ProductionModerationStatus.hidden);
  });

  it('borrar contenido o el blog borra sus denuncias', async () => {
    const { owner, productionId, photo } = await setup();
    const reporter = await createTestUser(models);
    await report(reporter, productionId, photo._id);
    await report(reporter, productionId);

    await service.deleteItem(photo._id, ProductionItemKind.file, owner);
    const reports = models.connection.collection('productionreports');
    expect(await reports.countDocuments()).toBe(1);

    await service.deleteProduction(productionId, owner);
    expect(await reports.countDocuments()).toBe(0);
  });
});
