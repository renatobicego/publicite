import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

import mapModuleTesting from './production.test.module';
import {
  cleanProductionTestData,
  createTestUser,
  findDoc,
  getProductionTestModels,
  givePlanToUser,
  ProductionTestModels,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import { ProductionTicketService } from '../production/application/service/production.ticket.service';
import { ProductionCommunityService } from '../production/application/service/production.community.service';
import {
  ProductionFileType,
  ProductionItemKind,
  ProductionLockReason,
} from '../production/domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

// Base remota de QA: cada test hace varias idas y vueltas.
jest.setTimeout(60_000);

describe('Mis Producciones - Fase 8: fans, reseñas y comentarios (FAN-01, REV-01/02)', () => {
  let moduleRef: TestingModule;
  let service: ProductionService;
  let tickets: ProductionTicketService;
  let community: ProductionCommunityService;
  let models: ProductionTestModels;

  beforeAll(async () => {
    moduleRef = await mapModuleTesting.get('production')!();
    service = moduleRef.get<ProductionService>('ProductionServiceInterface');
    tickets = moduleRef.get<ProductionTicketService>(
      'ProductionTicketServiceInterface',
    );
    community = moduleRef.get<ProductionCommunityService>(
      'ProductionCommunityServiceInterface',
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

  const createBlog = async (owner: string, title = 'Blog') => {
    const { _id } = await service.createProduction({ title }, owner);
    return _id;
  };

  const uploadPhoto = (owner: string, productionId: string) =>
    service.uploadFile(
      { productionId, fileType: ProductionFileType.photo, key: 'key-' + Math.random() },
      owner,
    );

  /** Blog con ticket gratuito para todo el blog y un visitante que ya lo tiene. */
  const setupWithFreeTicket = async () => {
    const owner = await createTestUser(models);
    const visitor = await createTestUser(models);
    const productionId = await createBlog(owner);
    const photo = await uploadPhoto(owner, productionId);
    const ticket = await tickets.createProductionTicket(
      { productionId, isPaid: false, untilClose: true },
      owner,
    );
    await tickets.purchaseProductionTicket(
      { ticketId: ticket._id, acceptNoRefund: false },
      visitor,
    );
    return { owner, visitor, productionId, photo, ticket };
  };

  describe('Fans (FAN-01)', () => {
    it('suma y resta fans sin duplicar, y el staff ve el listado', async () => {
      const owner = await createTestUser(models);
      const fan = await createTestUser(models);
      const productionId = await createBlog(owner);

      let view = await community.becomeProductionFan(productionId, fan);
      expect(view.fansCount).toBe(1);
      expect(view.viewer.isFan).toBe(true);

      view = await community.becomeProductionFan(productionId, fan);
      expect(view.fansCount).toBe(1);

      const fans = await community.getProductionFans(productionId, owner, 1, 10);
      expect(fans.total).toBe(1);
      expect(fans.fans[0].user).toBe(fan);
      expect(fans.fans[0].userInfo?.username).toBeTruthy();
      expect((fans.fans[0].userInfo as any)?.email).toBeUndefined();
      await expect(
        community.getProductionFans(productionId, fan, 1, 10),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const mine = await community.getMyFanProductions(fan, 1, 10);
      expect(mine.productions.map((p) => p._id)).toEqual([productionId]);
      expect(mine.productions[0].viewer.isFan).toBe(true);

      view = await community.stopBeingProductionFan(productionId, fan);
      expect(view.fansCount).toBe(0);
      expect(view.viewer.isFan).toBe(false);
    });

    it('el dueño no es fan de su blog y nadie es fan de lo que no ve', async () => {
      const owner = await createTestUser(models);
      const stranger = await createTestUser(models);
      const productionId = await createBlog(owner);
      await expect(
        community.becomeProductionFan(productionId, owner),
      ).rejects.toBeInstanceOf(BadRequestException);

      await service.setProductionVisibility(productionId, Visibility.friends, owner);
      await expect(
        community.becomeProductionFan(productionId, stranger),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('Reseñas (REV-01)', () => {
    it('sólo reseña quien accedió con un ticket, una vez, y promedia', async () => {
      const { owner, visitor, productionId } = await setupWithFreeTicket();
      const outsider = await createTestUser(models);

      await expect(
        community.createProductionReview(
          { productionId, rating: 5, review: 'Genial' },
          outsider,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        community.createProductionReview(
          { productionId, rating: 5, review: 'Mi blog' },
          owner,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      const review = await community.createProductionReview(
        { productionId, rating: 4, review: 'Muy bueno' },
        visitor,
      );
      expect(review).toMatchObject({ rating: 4, author: visitor });
      await expect(
        community.createProductionReview(
          { productionId, rating: 1, review: 'Otra' },
          visitor,
        ),
      ).rejects.toThrow('Ya reseñaste');

      let view = await service.findProductionById(productionId, outsider);
      expect(view).toMatchObject({ rating: 4, reviewsCount: 1 });

      await community.updateProductionReview(review._id, { rating: 2 }, visitor);
      view = await service.findProductionById(productionId, outsider);
      expect(view.rating).toBe(2);
      await expect(
        community.updateProductionReview(review._id, { rating: 5 }, outsider),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const list = await community.getProductionReviews(productionId, undefined, 1, 10);
      expect(list.total).toBe(1);
      expect(list.rating).toBe(2);
      expect(list.reviews[0].authorInfo?._id).toBe(visitor);

      await community.deleteProductionReview(review._id, visitor);
      view = await service.findProductionById(productionId, outsider);
      expect(view).toMatchObject({ rating: null, reviewsCount: 0 });
    });
  });

  describe('Reseña obligatoria en tickets pagos (REV-02, TKT-09, D10)', () => {
    it('insiste y bloquea compras y visitas hasta reseñar', async () => {
      const owner = await createTestUser(models);
      const buyer = await createTestUser(models);
      const admin = await createTestUser(models);
      await givePlanToUser(models, owner, { isFree: false });
      const paidBlog = await createBlog(owner, 'Pago');
      await tickets.setProductionPayoutAlias(paidBlog, 'creador.alias', owner);
      const paidPhoto = await uploadPhoto(owner, paidBlog);
      const paidTicket = await tickets.createProductionTicket(
        { productionId: paidBlog, isPaid: true, price: 300, untilClose: true },
        owner,
      );

      const otherOwner = await createTestUser(models);
      const otherBlog = await createBlog(otherOwner, 'Otro');
      const otherPhoto = await uploadPhoto(otherOwner, otherBlog);
      const otherTicket = await tickets.createProductionTicket(
        { productionId: otherBlog, isPaid: false, untilClose: true },
        otherOwner,
      );

      const purchase = await tickets.purchaseProductionTicket(
        { ticketId: paidTicket._id, acceptNoRefund: true },
        buyer,
      );
      await tickets.confirmProductionTicketPurchase(purchase._id, admin, true);

      // Todavía no usó el ticket: no hay bloqueo.
      expect(await community.getMyPendingProductionReview(buyer)).toBeNull();

      // Usa el ticket: la reseña pasa a ser obligatoria.
      await service.getProductionItemById(paidPhoto._id, buyer);
      const pending = await community.getMyPendingProductionReview(buyer);
      expect(pending).toMatchObject({ productionId: paidBlog, productionTitle: 'Pago' });

      // Bloquea visitar otras producciones...
      const blocked = await service.getProductionItems(otherBlog, undefined, buyer);
      expect(blocked.production.viewer.lockReason).toBe(ProductionLockReason.pendingReview);
      expect(blocked.production.viewer.pendingReviewProductionId).toBe(paidBlog);
      expect(blocked.items).toHaveLength(0);
      await expect(
        service.getProductionItemById(otherPhoto._id, buyer),
      ).rejects.toBeInstanceOf(NotFoundException);
      // ...y comprar tickets nuevos.
      await expect(
        tickets.purchaseProductionTicket(
          { ticketId: otherTicket._id, acceptNoRefund: false },
          buyer,
        ),
      ).rejects.toThrow('reseña pendiente');

      // La producción a reseñar sigue accesible.
      const own = await service.getProductionItemById(paidPhoto._id, buyer);
      expect(own.key).toBeTruthy();

      await community.createProductionReview(
        { productionId: paidBlog, rating: 5, review: 'Valió la pena' },
        buyer,
      );

      expect(await community.getMyPendingProductionReview(buyer)).toBeNull();
      const unlocked = await service.getProductionItems(otherBlog, undefined, buyer);
      expect(unlocked.production.viewer.canViewContent).toBe(true);
      await expect(
        tickets.purchaseProductionTicket(
          { ticketId: otherTicket._id, acceptNoRefund: false },
          buyer,
        ),
      ).resolves.toBeDefined();
    });

    it('un ticket gratuito no obliga a reseñar', async () => {
      const { visitor, photo } = await setupWithFreeTicket();
      await service.getProductionItemById(photo._id, visitor);
      expect(await community.getMyPendingProductionReview(visitor)).toBeNull();
    });
  });

  describe('Comentarios (REV-01)', () => {
    it('comenta, responde el staff, se edita, se lista y se modera', async () => {
      const { owner, visitor, productionId, photo } = await setupWithFreeTicket();
      const stranger = await createTestUser(models);

      const onBlog = await community.createProductionComment(
        { productionId, comment: 'Hermoso blog' },
        visitor,
      );
      const onPhoto = await community.createProductionComment(
        { productionId, itemId: photo._id, comment: 'Qué foto' },
        visitor,
      );
      expect(onPhoto.item).toBe(photo._id);

      const replied = await community.replyProductionComment(
        onBlog._id,
        '¡Gracias!',
        owner,
      );
      expect(replied.response?.comment).toBe('¡Gracias!');
      await expect(
        community.replyProductionComment(onBlog._id, 'Otra', owner),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        community.replyProductionComment(onPhoto._id, 'No soy staff', stranger),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const edited = await community.updateProductionComment(
        onBlog._id,
        'Hermoso blog, de verdad',
        visitor,
      );
      expect(edited.isEdited).toBe(true);
      await expect(
        community.updateProductionComment(onBlog._id, 'hackeado', stranger),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const blogComments = await community.getProductionComments(
        productionId,
        undefined,
        undefined,
        1,
        10,
      );
      expect(blogComments.total).toBe(1);
      expect(blogComments.comments[0].response?.userInfo?._id).toBe(owner);
      const photoComments = await community.getProductionComments(
        productionId,
        photo._id,
        visitor,
        1,
        10,
      );
      expect(photoComments.comments.map((c) => c._id)).toEqual([onPhoto._id]);

      await expect(
        community.deleteProductionComment(onBlog._id, stranger),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await community.deleteProductionComment(onBlog._id, owner);
      expect(
        await models.connection.collection('productioncomments').countDocuments(),
      ).toBe(1);

      await service.deleteItem(photo._id, ProductionItemKind.file, owner);
      expect(
        await models.connection.collection('productioncomments').countDocuments(),
      ).toBe(0);
    });

    it('no se comenta contenido bloqueado por ticket', async () => {
      const owner = await createTestUser(models);
      const visitor = await createTestUser(models);
      const productionId = await createBlog(owner);
      const photo = await uploadPhoto(owner, productionId);
      await tickets.createProductionTicket(
        { productionId, targetId: photo._id, isPaid: false, untilClose: true },
        owner,
      );

      await expect(
        community.createProductionComment(
          { productionId, itemId: photo._id, comment: 'Hola' },
          visitor,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        community.createProductionComment({ productionId, comment: 'Hola' }, visitor),
      ).resolves.toBeDefined();
    });
  });

  it('borrar el blog borra fans, reseñas y comentarios', async () => {
    const { owner, visitor, productionId } = await setupWithFreeTicket();
    await community.becomeProductionFan(productionId, visitor);
    await community.createProductionReview(
      { productionId, rating: 3, review: 'Bien' },
      visitor,
    );
    await community.createProductionComment({ productionId, comment: 'Hola' }, visitor);

    await service.deleteProduction(productionId, owner);

    for (const name of ['productionfans', 'productionreviews', 'productioncomments']) {
      expect(await models.connection.collection(name).countDocuments()).toBe(0);
    }
    expect(await findDoc(models.production, productionId)).toBeNull();
  });
});
