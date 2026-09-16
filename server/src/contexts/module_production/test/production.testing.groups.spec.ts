import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
import {
  ProductionFileType,
  ProductionItemKind,
  ProductionOwnerType,
  ProductionRole,
} from '../production/domain/entity/enum/production.enums';
import {
  group_creator_changed,
  group_deleted,
} from 'src/contexts/module_shared/event-emmiter/events';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

// Base remota de QA: cada test hace varias idas y vueltas.
jest.setTimeout(60_000);

describe('Mis Producciones - Fase 6: blogs de grupo y roles (GRP-01..08)', () => {
  let moduleRef: TestingModule;
  let service: ProductionService;
  let tickets: ProductionTicketService;
  let events: EventEmitter2;
  let models: ProductionTestModels;

  beforeAll(async () => {
    moduleRef = await mapModuleTesting.get('production')!();
    await moduleRef.init();
    service = moduleRef.get<ProductionService>('ProductionServiceInterface');
    tickets = moduleRef.get<ProductionTicketService>(
      'ProductionTicketServiceInterface',
    );
    events = moduleRef.get(EventEmitter2);
    models = getProductionTestModels(moduleRef);
    await models.production.syncIndexes();
  });

  afterAll(async () => {
    await cleanProductionTestData(models);
    await moduleRef.close();
  });

  afterEach(async () => {
    await cleanProductionTestData(models);
  });

  /** Grupo con creator, un admin (moderador) y un miembro, y su blog. */
  const setupGroupBlog = async (creatorPlan?: Parameters<typeof givePlanToUser>[2]) => {
    const creator = await createTestUser(models);
    const moderator = await createTestUser(models);
    const member = await createTestUser(models);
    const outsider = await createTestUser(models);
    if (creatorPlan) await givePlanToUser(models, creator, creatorPlan);
    const groupId = await createTestGroup(models, {
      creator,
      admins: [moderator],
      members: [member],
    });
    const { _id: productionId } = await service.createProduction(
      { title: 'Blog del grupo', groupId },
      creator,
    );
    return { creator, moderator, member, outsider, groupId, productionId };
  };

  const upload = (userId: string, productionId: string, parentId?: string) =>
    service.uploadFile(
      {
        productionId,
        parentId,
        fileType: ProductionFileType.photo,
        key: 'key-' + Math.random(),
      },
      userId,
    );

  describe('Creación (GRP-01..03, RNF-14)', () => {
    it('el creator crea el blog del grupo y se descuenta de su cupo', async () => {
      const { creator, groupId, productionId } = await setupGroupBlog();

      const production = await findDoc(models.production, productionId);
      expect(production.ownerType).toBe(ProductionOwnerType.Group);
      expect(production.owner.toString()).toBe(groupId);
      expect(production.creator.toString()).toBe(creator);

      const group = await findDoc(models.group, groupId);
      expect(group.blog.toString()).toBe(productionId);

      const limits = await service.getProductionLimits(creator);
      expect(limits).toMatchObject({ groupBlogCount: 1, groupBlogsAvailable: 0 });

      // PLN-01: el gratuito además permite su blog personal.
      await expect(
        service.createProduction({ title: 'Personal' }, creator),
      ).resolves.toBeDefined();
    });

    it('ni un admin ni un miembro del grupo pueden crear el blog (GRP-03)', async () => {
      const creator = await createTestUser(models);
      const moderator = await createTestUser(models);
      const member = await createTestUser(models);
      const groupId = await createTestGroup(models, {
        creator,
        admins: [moderator],
        members: [member],
      });

      for (const userId of [moderator, member]) {
        await expect(
          service.createProduction({ title: 'Intento', groupId }, userId),
        ).rejects.toThrow('Sólo el creador del grupo');
      }
      await expect(
        service.createProduction({ title: 'x', groupId: '64b000000000000000000000' }, creator),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('un grupo tiene un único blog', async () => {
      const { creator, groupId } = await setupGroupBlog({ groupBlogsCount: 5 });
      await expect(
        service.createProduction({ title: 'Segundo', groupId }, creator),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('el plan gratuito permite un solo blog de grupo; el pago, más (PLN-01/02)', async () => {
      const creator = await createTestUser(models);
      const groupA = await createTestGroup(models, { creator });
      const groupB = await createTestGroup(models, { creator });

      await service.createProduction({ title: 'A', groupId: groupA }, creator);
      await expect(
        service.createProduction({ title: 'B', groupId: groupB }, creator),
      ).rejects.toThrow('límite de blogs de grupo');

      await givePlanToUser(models, creator, { groupBlogsCount: 3 });
      await expect(
        service.createProduction({ title: 'B', groupId: groupB }, creator),
      ).resolves.toBeDefined();
    });
  });

  describe('Roles derivados del grupo (GRP-04..07)', () => {
    it('informa el rol de cada uno', async () => {
      const { creator, moderator, member, outsider, productionId } =
        await setupGroupBlog();
      const roleOf = async (userId: string) =>
        (await service.findProductionById(productionId, userId)).viewer;

      expect(await roleOf(creator)).toMatchObject({
        role: ProductionRole.admin,
        canEdit: true,
        canDelete: true,
        canManagePayout: true,
      });
      expect(await roleOf(moderator)).toMatchObject({
        role: ProductionRole.moderator,
        canEdit: true,
        canManageAccess: true,
        canDelete: false,
        canManagePayout: false,
      });
      expect(await roleOf(member)).toMatchObject({
        role: ProductionRole.viewer,
        canEdit: false,
        canViewContent: true,
      });
      expect((await roleOf(outsider)).role).toBe(ProductionRole.visitor);
    });

    it('el moderador opera el contenido pero no borra el blog ni cobra (GRP-06)', async () => {
      const { creator, moderator, productionId } = await setupGroupBlog();

      const folder = await service.createFolder(
        { productionId, name: 'Del moderador' },
        moderator,
      );
      const photo = await upload(moderator, productionId, folder._id);
      await service.updateFile(photo._id, { name: 'Renombrada' }, moderator);
      await service.setProductionItemVisibility(folder._id, Visibility.registered, moderator);
      await service.setProductionAccessKey(productionId, 'clave-grupo', moderator);
      await service.setProductionAccessKey(productionId, null, moderator);
      await service.deleteItem(photo._id, ProductionItemKind.file, moderator);

      await expect(
        service.deleteProduction(productionId, moderator),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        tickets.setProductionPayoutAlias(productionId, 'moderador.alias', moderator),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      await expect(
        tickets.setProductionPayoutAlias(productionId, 'creador.alias', creator),
      ).resolves.toBeDefined();
    });

    it('el miembro sólo lee, incluso lo restringido y lo que tiene ticket (GRP-07)', async () => {
      const { creator, member, outsider, productionId } = await setupGroupBlog();
      const folder = await service.createFolder(
        { productionId, name: 'Top', visibility: Visibility.topfriends },
        creator,
      );
      const photo = await upload(creator, productionId, folder._id);
      await tickets.createProductionTicket(
        { productionId, targetId: folder._id, isPaid: false, untilClose: true },
        creator,
      );

      const asMember = await service.getProductionItemById(photo._id, member);
      expect(asMember.key).toBeTruthy();
      await expect(upload(member, productionId)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(
        service.updateProduction(productionId, { title: 'x' }, member),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      // Afuera del grupo, lo restringido por agenda queda oculto.
      await expect(
        service.getProductionItemById(photo._id, outsider),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('los roles siguen a las listas del grupo', async () => {
      const { member, productionId, groupId } = await setupGroupBlog();
      await models.group.updateOne(
        { _id: groupId },
        { $pull: { members: member }, $push: { admins: member } },
      );
      const view = await service.findProductionById(productionId, member);
      expect(view.viewer.role).toBe(ProductionRole.moderator);
    });
  });

  describe('Plan del creator (GRP-08, RNF-14)', () => {
    it('el cupo de archivos es el del plan del creator aunque suba un moderador', async () => {
      const { moderator, productionId } = await setupGroupBlog({ filesPerBlogCount: 2 });
      await upload(moderator, productionId);
      await upload(moderator, productionId);
      await expect(upload(moderator, productionId)).rejects.toThrow(
        'Alcanzaste el límite de 2 archivos',
      );
    });

    it('los tickets pagos dependen del plan del creator', async () => {
      const free = await setupGroupBlog();
      await tickets.setProductionPayoutAlias(free.productionId, 'creador.alias', free.creator);
      await expect(
        tickets.createProductionTicket(
          { productionId: free.productionId, isPaid: true, price: 100, untilClose: true },
          free.moderator,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      await cleanProductionTestData(models);

      const paid = await setupGroupBlog({ isFree: false });
      await tickets.setProductionPayoutAlias(paid.productionId, 'creador.alias', paid.creator);
      const ticket = await tickets.createProductionTicket(
        { productionId: paid.productionId, isPaid: true, price: 100, untilClose: true },
        paid.moderator,
      );
      expect(ticket.isPaid).toBe(true);

      // El que cobra es el creator (GRP-05).
      const purchase = await tickets.purchaseProductionTicket(
        { ticketId: ticket._id, acceptNoRefund: true },
        paid.outsider,
      );
      expect(purchase.creator).toBe(paid.creator);
    });
  });

  describe('Eventos del grupo', () => {
    it('borrar el grupo borra su blog', async () => {
      const { creator, groupId, productionId } = await setupGroupBlog();
      await upload(creator, productionId);

      await models.group.deleteOne({ _id: groupId });
      await events.emitAsync(group_deleted, { groupId });

      expect(await models.production.countDocuments()).toBe(0);
      expect(await models.item.countDocuments()).toBe(0);
      const user = await findDoc(models.user, creator);
      expect(user.productions).toHaveLength(0);
    });

    it('si el creator cede el grupo, el blog pasa al nuevo creator', async () => {
      const { creator, moderator, groupId, productionId } = await setupGroupBlog();
      await tickets.setProductionPayoutAlias(productionId, 'viejo.alias', creator);

      await models.group.updateOne(
        { _id: groupId },
        { $set: { creator: moderator }, $pull: { admins: moderator } },
      );
      await events.emitAsync(group_creator_changed, {
        groupId,
        previousCreator: creator,
        newCreator: moderator,
      });

      const production = await findDoc(models.production, productionId);
      expect(production.creator.toString()).toBe(moderator);
      expect(production.aliasCbu).toBeNull();
      expect((await findDoc(models.user, creator)).productions).toHaveLength(0);
      expect(
        (await findDoc(models.user, moderator)).productions.map(String),
      ).toEqual([productionId]);

      const view = await service.findProductionById(productionId, moderator);
      expect(view.viewer.role).toBe(ProductionRole.admin);
    });
  });
});
