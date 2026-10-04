import { UnauthorizedException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

import mapModuleTesting, { mockTokenService } from './production.test.module';
import {
  cleanProductionTestData,
  createTestGroup,
  createTestUser,
  getProductionTestModels,
  givePlanToUser,
  ProductionTestModels,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import { ProductionInsightsService } from '../production/application/service/production.insights.service';
import {
  ProductionFileType,
  ProductionOwnerType,
  ProductionRole,
} from '../production/domain/entity/enum/production.enums';

// Base remota de QA: cada test hace varias idas y vueltas.
jest.setTimeout(60_000);

describe('Mis Producciones - Fase 4: CONTROL Consumo (PC-05, SB-05)', () => {
  let moduleRef: TestingModule;
  let service: ProductionService;
  let insights: ProductionInsightsService;
  let models: ProductionTestModels;

  beforeAll(async () => {
    moduleRef = await mapModuleTesting.get('production')!();
    service = moduleRef.get<ProductionService>('ProductionServiceInterface');
    insights = moduleRef.get<ProductionInsightsService>(
      'ProductionInsightsServiceInterface',
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

  const upload = (userId: string, productionId: string) =>
    service.uploadFile(
      { productionId, fileType: ProductionFileType.photo, key: 'k' + Math.random() },
      userId,
    );

  it('muestra tokens, límites y archivos usados de los blogs del usuario', async () => {
    const userId = await createTestUser(models);
    await givePlanToUser(models, userId, { groupBlogsCount: 2, filesPerBlogCount: 20 });
    const { _id: personal } = await service.createProduction({ title: 'Personal' }, userId);
    const groupId = await createTestGroup(models, { creator: userId });
    const { _id: groupBlog } = await service.createProduction(
      { title: 'Del grupo', groupId },
      userId,
    );
    await upload(userId, personal);
    await upload(userId, personal);
    await upload(userId, groupBlog);

    const consumption = await insights.getProductionConsumption(userId);

    expect(consumption.tokens).toMatchObject({ used: 30, remaining: 70, source: 'free' });
    expect(consumption.limits).toMatchObject({
      personalBlogCount: 1,
      groupBlogCount: 1,
      totalGroupBlogLimit: 2,
      groupBlogsAvailable: 1,
      filesPerBlogLimit: 20,
    });
    expect(consumption.blogs).toEqual([
      expect.objectContaining({
        productionId: personal,
        ownerType: ProductionOwnerType.User,
        role: ProductionRole.admin,
        filesCount: 2,
        filesPerBlogLimit: 20,
        filesAvailable: 18,
      }),
      expect.objectContaining({
        productionId: groupBlog,
        ownerType: ProductionOwnerType.Group,
        filesCount: 1,
        filesAvailable: 19,
      }),
    ]);
  });

  it('un moderador ve el consumo del blog del grupo con el límite del creator', async () => {
    const creator = await createTestUser(models);
    const moderator = await createTestUser(models);
    const member = await createTestUser(models);
    await givePlanToUser(models, creator, { filesPerBlogCount: 7 });
    const groupId = await createTestGroup(models, {
      creator,
      admins: [moderator],
      members: [member],
    });
    const { _id: groupBlog } = await service.createProduction(
      { title: 'Del grupo', groupId },
      creator,
    );

    const asModerator = await insights.getProductionConsumption(moderator, groupBlog);
    expect(asModerator.blogs).toEqual([
      expect.objectContaining({
        role: ProductionRole.moderator,
        filesPerBlogLimit: 7,
        filesAvailable: 7,
      }),
    ]);

    await expect(
      insights.getProductionConsumption(member, groupBlog),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('si el token bucket falla, el panel responde igual sin tokens', async () => {
    const userId = await createTestUser(models);
    mockTokenService.getStatusForUser.mockRejectedValueOnce(new Error('sin OpenAI'));

    const consumption = await insights.getProductionConsumption(userId);
    expect(consumption.tokens).toBeNull();
    expect(consumption.blogs).toEqual([]);
    expect(consumption.limits.filesPerBlogLimit).toBe(10);
  });
});
