import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import mapModuleTesting from './production.test.module';
import {
  cleanProductionTestData,
  createTestUser,
  getProductionTestModels,
  givePlanToUser,
  ProductionTestModels,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import { ProductionTicketService } from '../production/application/service/production.ticket.service';
import {
  ProductionFileType,
  ProductionItemKind,
  ProductionLockReason,
} from '../production/domain/entity/enum/production.enums';
import {
  ProductionCommissionStatus,
  ProductionTicketPurchaseStatus,
} from '../production/domain/entity/enum/production-ticket.enums';

const HOUR = 60 * 60 * 1000;

// Base remota de QA: cada test hace varias idas y vueltas.
jest.setTimeout(60_000);

describe('Mis Producciones - Fase 5: tickets por transferencia', () => {
  let moduleRef: TestingModule;
  let service: ProductionService;
  let tickets: ProductionTicketService;
  let models: ProductionTestModels;

  beforeAll(async () => {
    process.env.PRODUCTION_TICKETS_TRANSFER_ALIAS = 'soonpublicite.mp';
    moduleRef = await mapModuleTesting.get('production')!();
    service = moduleRef.get<ProductionService>('ProductionServiceInterface');
    tickets = moduleRef.get<ProductionTicketService>(
      'ProductionTicketServiceInterface',
    );
    models = getProductionTestModels(moduleRef);
    await models.connection
      .collection('productionticketpurchases')
      .createIndex(
        { ticket: 1, buyer: 1 },
        {
          unique: true,
          partialFilterExpression: { isOpen: true },
          name: 'unique_open_purchase_per_buyer',
        },
      )
      .catch(() => undefined);
  });

  afterAll(async () => {
    delete process.env.PRODUCTION_TICKETS_TRANSFER_ALIAS;
    await cleanProductionTestData(models);
    await moduleRef.close();
  });

  afterEach(async () => {
    await cleanProductionTestData(models);
  });

  /**
   * Blog de un creador con plan pago y alias cargado: carpeta "Premium" con
   * una foto y una subcarpeta "VIP" con otra foto.
   */
  const setupPaidBlog = async () => {
    const owner = await createTestUser(models);
    await givePlanToUser(models, owner, { isFree: false, filesPerBlogCount: 20 });
    const { _id: productionId } = await service.createProduction(
      { title: 'Blog pago' },
      owner,
    );
    await tickets.setProductionPayoutAlias(productionId, 'creador.alias', owner);
    const folder = await service.createFolder(
      { productionId, name: 'Premium' },
      owner,
    );
    const photo = await service.uploadFile(
      {
        productionId,
        parentId: folder._id,
        fileType: ProductionFileType.photo,
        key: 'key-premium',
      },
      owner,
    );
    const vip = await service.createFolder(
      { productionId, parentId: folder._id, name: 'VIP' },
      owner,
    );
    const vipPhoto = await service.uploadFile(
      {
        productionId,
        parentId: vip._id,
        fileType: ProductionFileType.photo,
        key: 'key-vip',
      },
      owner,
    );
    return { owner, productionId, folder, photo, vip, vipPhoto };
  };

  const paidTicket = (productionId: string, targetId: string, price = 1000) =>
    ({ productionId, targetId, isPaid: true, price, durationHours: 24 });

  describe('Configuración (TKT-01..03, TKT-10/11, PLN-03)', () => {
    it('el plan gratuito sólo permite tickets gratuitos', async () => {
      const owner = await createTestUser(models);
      const { _id: productionId } = await service.createProduction(
        { title: 'Gratis' },
        owner,
      );
      const folder = await service.createFolder({ productionId, name: 'A' }, owner);

      await expect(
        tickets.createProductionTicket(paidTicket(productionId, folder._id), owner),
      ).rejects.toBeInstanceOf(ForbiddenException);

      const free = await tickets.createProductionTicket(
        { productionId, targetId: folder._id, isPaid: false, untilClose: true },
        owner,
      );
      expect(free.isPaid).toBe(false);
      expect(free.price).toBe(0);
    });

    it('un ticket pago exige alias/CBU cargado y válido', async () => {
      const owner = await createTestUser(models);
      await givePlanToUser(models, owner, { isFree: false });
      const { _id: productionId } = await service.createProduction(
        { title: 'Sin alias' },
        owner,
      );

      await expect(
        tickets.createProductionTicket(
          { productionId, isPaid: true, price: 500, untilClose: true },
          owner,
        ),
      ).rejects.toThrow('alias o CBU');
      await expect(
        tickets.setProductionPayoutAlias(productionId, 'no válido!', owner),
      ).rejects.toBeInstanceOf(BadRequestException);

      const visitor = await createTestUser(models);
      await expect(
        tickets.setProductionPayoutAlias(productionId, 'otro.alias', visitor),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const withCbu = await tickets.setProductionPayoutAlias(
        productionId,
        '0000003100000000000001',
        owner,
      );
      expect(withCbu.aliasCbu).toBe('0000003100000000000001');

      // Un ticket pago necesita contenido para vender.
      await expect(
        tickets.createProductionTicket(
          { productionId, isPaid: true, price: 500, untilClose: true },
          owner,
        ),
      ).rejects.toThrow('todavía no tiene contenido');
      const emptyFolder = await service.createFolder(
        { productionId, name: 'Vacía' },
        owner,
      );
      await expect(
        tickets.createProductionTicket(
          paidTicket(productionId, emptyFolder._id),
          owner,
        ),
      ).rejects.toThrow('La carpeta está vacía');

      await service.uploadFile(
        { productionId, fileType: ProductionFileType.photo, key: 'key-alias' },
        owner,
      );
      await expect(
        tickets.createProductionTicket(
          { productionId, isPaid: true, price: 500, untilClose: true },
          owner,
        ),
      ).resolves.toBeDefined();
    });

    it('valida precio y duración mínima de 24 hs (TKT-03)', async () => {
      const { owner, productionId, folder } = await setupPaidBlog();
      await expect(
        tickets.createProductionTicket(
          { productionId, targetId: folder._id, isPaid: true, price: 0, durationHours: 48 },
          owner,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        tickets.createProductionTicket(
          { productionId, targetId: folder._id, isPaid: true, price: 10, durationHours: 12 },
          owner,
        ),
      ).rejects.toThrow('al menos 24 horas');
    });

    it('un solo ticket por contenido; informa archivos incluidos y métricas', async () => {
      const { owner, productionId, folder } = await setupPaidBlog();
      const created = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );
      expect(created.filesCount).toBe(2);
      expect(created.targetName).toBe('Premium');
      expect(created.stats).toEqual({
        purchases: 0,
        active: 0,
        revenue: 0,
        netRevenue: 0,
        commission: 0,
        paidOut: 0,
      });

      await expect(
        tickets.createProductionTicket(paidTicket(productionId, folder._id), owner),
      ).rejects.toThrow('ya tiene un ticket');

      const list = await tickets.getProductionTickets(productionId, owner);
      expect(list).toHaveLength(1);
    });
  });

  describe('Compra por transferencia (TKT-04..08)', () => {
    it('recorre pendiente → activo con dos transferencias (90% al blog, 10% a Soonpublicité) y factura', async () => {
      const { owner, productionId, folder, photo } = await setupPaidBlog();
      const buyer = await createTestUser(models);
      const admin = await createTestUser(models);
      const ticket = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );

      // El contenido se lista bloqueado, con el ticket para comprar.
      const locked = await service.getProductionItems(productionId, folder._id, buyer);
      const lockedPhoto = locked.items.find((i) => i._id === photo._id)!;
      expect(lockedPhoto.key).toBeNull();
      expect(lockedPhoto.access.lockReason).toBe(ProductionLockReason.ticket);
      expect(lockedPhoto.access.ticket).toMatchObject({ _id: ticket._id, price: 1000 });

      // TKT-04: checkout con archivos incluidos y aviso de no devolución.
      const checkout = await tickets.getProductionTicketCheckout(ticket._id, buyer);
      expect(checkout.requiresNoRefundAcceptance).toBe(true);
      expect(checkout.ticket.filesCount).toBe(2);
      // Dos transferencias: la parte del creador al blog y la comisión.
      expect(checkout.creatorPaymentInstructions).toMatchObject({
        alias: 'creador.alias',
        amount: 900,
      });
      expect(checkout.commissionPaymentInstructions).toMatchObject({
        alias: 'soonpublicite.mp',
        amount: 100,
      });

      await expect(
        tickets.purchaseProductionTicket(
          { ticketId: ticket._id, acceptNoRefund: false },
          buyer,
        ),
      ).rejects.toThrow('no tienen devolución');

      // TKT-05: queda pendiente hasta que el staff verifique su transferencia.
      const purchase = await tickets.purchaseProductionTicket(
        {
          ticketId: ticket._id,
          acceptNoRefund: true,
          transferReference: 'OP-123',
          transferReceiptKey: 'recibo-blog',
          commissionReceiptKey: 'recibo-comision',
        },
        buyer,
      );
      expect(purchase.status).toBe(ProductionTicketPurchaseStatus.pending);
      expect(purchase.commissionStatus).toBe(ProductionCommissionStatus.pending);
      expect(purchase.creatorPaymentInstructions).toMatchObject({
        alias: 'creador.alias',
        amount: 900,
        reference: purchase._id,
      });
      expect(purchase.commissionPaymentInstructions).toMatchObject({
        alias: 'soonpublicite.mp',
        amount: 100,
      });
      expect(purchase.commissionReceiptKey).toBe('recibo-comision');

      await expect(
        tickets.purchaseProductionTicket(
          { ticketId: ticket._id, acceptNoRefund: true },
          buyer,
        ),
      ).rejects.toThrow('Ya tenés una compra');

      let detail = await service.getProductionItemById(photo._id, buyer);
      expect(detail.key).toBeNull();

      // TKT-06: el admin ve la transacción con el reparto y el alias.
      const adminList = await tickets.getProductionTicketPurchasesAdmin(
        { status: ProductionTicketPurchaseStatus.pending },
        1,
        10,
      );
      expect(adminList.total).toBe(1);
      expect(adminList.purchases[0]).toMatchObject({
        commissionPercent: 10,
        commissionAmount: 100,
        creatorPayoutAmount: 900,
        payoutAliasCbu: 'creador.alias',
        transferReference: 'OP-123',
        transferReceiptKey: 'recibo-blog',
        commissionReceiptKey: 'recibo-comision',
      });
      expect(adminList.purchases[0].buyerInfo?.email).toBeTruthy();

      // La factura sólo se asocia con la comisión cobrada.
      await expect(
        tickets.attachFacturaToProductionTicketPurchase(
          purchase._id,
          'https://files.example.com/factura.pdf',
          admin,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      // Sólo el staff del blog habilita.
      await expect(
        tickets.activateProductionTicketPurchase(purchase._id, buyer),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      // TKT-07: el creador verificó su transferencia y habilita el acceso,
      // sin esperar a que Soonpublicité controle la comisión.
      const before = Date.now();
      const activated = await tickets.activateProductionTicketPurchase(
        purchase._id,
        owner,
      );
      expect(activated.status).toBe(ProductionTicketPurchaseStatus.active);
      const expiresIn = activated.expiresAt!.getTime() - before;
      expect(expiresIn).toBeGreaterThan(23.9 * HOUR);
      expect(expiresIn).toBeLessThan(24.1 * HOUR);

      detail = await service.getProductionItemById(photo._id, buyer);
      expect(detail.key).toBe('key-premium');
      const stored = await models.connection
        .collection('productionticketpurchases')
        .findOne({});
      expect(stored!.firstAccessAt).toBeInstanceOf(Date);

      const commissionPaid = await tickets.setProductionTicketCommissionStatus(
        purchase._id,
        ProductionCommissionStatus.paid,
        admin,
      );
      expect(commissionPaid.commissionStatus).toBe(ProductionCommissionStatus.paid);

      const withFactura = await tickets.attachFacturaToProductionTicketPurchase(
        purchase._id,
        'https://files.example.com/factura.pdf',
        admin,
      );
      expect(withFactura.facturaUrl).toBe('https://files.example.com/factura.pdf');

      const sales = await tickets.getProductionTicketSales(
        productionId,
        owner,
        undefined,
        1,
        10,
      );
      expect(sales.purchases[0].creatorPayoutAmount).toBe(900);
      // El staff ve su comprobante; el de la comisión y la factura son del
      // comprador y de Soonpublicité.
      expect(sales.purchases[0].transferReceiptKey).toBe('recibo-blog');
      expect(sales.purchases[0].commissionReceiptKey).toBeNull();
      expect(sales.purchases[0].facturaUrl).toBeNull();
      const mine = await tickets.getMyProductionTicketPurchases(buyer, undefined, 1, 10);
      expect(mine.purchases[0].facturaUrl).toBe(
        'https://files.example.com/factura.pdf',
      );
      const [withStats] = await tickets.getProductionTickets(productionId, owner);
      // Lo recaudado por el blog no incluye la comisión del 10%.
      expect(withStats.stats).toEqual({
        purchases: 1,
        active: 1,
        revenue: 1000,
        netRevenue: 900,
        commission: 100,
      });

// Quitar el ticket y volver a crearlo no pierde las ventas: los
      // totales y el listado van por destino, no por id de ticket.
      await tickets.deleteProductionTicket(withStats._id, owner);
      const recreated = await tickets.createProductionTicket(
        paidTicket(productionId, withStats.target!),
        owner,
      );
      expect(recreated._id).not.toBe(withStats._id);
      expect(recreated.stats).toEqual(withStats.stats);

      const salesOfTarget = await tickets.getProductionTicketSales(
        productionId,
        owner,
        undefined,
        1,
        10,
        withStats.target!,
      );
      expect(salesOfTarget.total).toBe(1);
    });

    it('la comisión impaga suspende el acceso hasta que se cobra', async () => {
      const { owner, productionId, folder, photo } = await setupPaidBlog();
      const buyer = await createTestUser(models);
      const admin = await createTestUser(models);
      const ticket = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );
      const purchase = await tickets.purchaseProductionTicket(
        { ticketId: ticket._id, acceptNoRefund: true },
        buyer,
      );

      await expect(
        tickets.setProductionTicketCommissionStatus(
          purchase._id,
          ProductionCommissionStatus.pending,
          admin,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      // Impaga antes de habilitar: el staff no puede dar el acceso.
      await tickets.setProductionTicketCommissionStatus(
        purchase._id,
        ProductionCommissionStatus.unpaid,
        admin,
      );
      await expect(
        tickets.activateProductionTicketPurchase(purchase._id, owner),
      ).rejects.toThrow('comisión está impaga');

      await tickets.setProductionTicketCommissionStatus(
        purchase._id,
        ProductionCommissionStatus.paid,
        admin,
      );
      const activated = await tickets.activateProductionTicketPurchase(
        purchase._id,
        owner,
      );
      expect((await service.getProductionItemById(photo._id, buyer)).key).toBe(
        'key-premium',
      );

      // Impaga con el acceso habilitado: se suspende sin tocar el vencimiento.
      const suspended = await tickets.setProductionTicketCommissionStatus(
        purchase._id,
        ProductionCommissionStatus.unpaid,
        admin,
      );
      expect(suspended.status).toBe(ProductionTicketPurchaseStatus.active);
      expect(suspended.expiresAt).toEqual(activated.expiresAt);
      expect((await service.getProductionItemById(photo._id, buyer)).key).toBeNull();
      const [withStats] = await tickets.getProductionTickets(productionId, owner);
      expect(withStats.stats?.active).toBe(0);

      // El comprador ve a dónde pagar la comisión para recuperar el acceso.
      const mine = await tickets.getMyProductionTicketPurchases(buyer, undefined, 1, 10);
      expect(mine.purchases[0].commissionStatus).toBe(
        ProductionCommissionStatus.unpaid,
      );
      expect(mine.purchases[0].commissionPaymentInstructions).toMatchObject({
        alias: 'soonpublicite.mp',
        amount: 100,
      });
      expect(mine.purchases[0].creatorPaymentInstructions).toBeNull();

      await tickets.setProductionTicketCommissionStatus(
        purchase._id,
        ProductionCommissionStatus.paid,
        admin,
      );
      expect((await service.getProductionItemById(photo._id, buyer)).key).toBe(
        'key-premium',
      );
    });

    it('el acceso vence solo (TKT-08) y se puede volver a comprar', async () => {
      const { owner, productionId, folder, photo } = await setupPaidBlog();
      const buyer = await createTestUser(models);
      const ticket = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );
      const purchase = await tickets.purchaseProductionTicket(
        { ticketId: ticket._id, acceptNoRefund: true },
        buyer,
      );
      await tickets.activateProductionTicketPurchase(purchase._id, owner);
      expect((await service.getProductionItemById(photo._id, buyer)).key).toBe(
        'key-premium',
      );

      await models.connection
        .collection('productionticketpurchases')
        .updateOne({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });

      expect((await service.getProductionItemById(photo._id, buyer)).key).toBeNull();
      const mine = await tickets.getMyProductionTicketPurchases(buyer, undefined, 1, 10);
      expect(mine.purchases[0].status).toBe(ProductionTicketPurchaseStatus.expired);

      // Con la reseña hecha puede volver a comprar.
      await models.connection
        .collection('productionticketpurchases')
        .updateOne({}, { $set: { reviewedAt: new Date() } });
      await expect(
        tickets.purchaseProductionTicket(
          { ticketId: ticket._id, acceptNoRefund: true },
          buyer,
        ),
      ).resolves.toMatchObject({ status: ProductionTicketPurchaseStatus.pending });
    });

    it('el staff rechaza una transferencia que no llegó', async () => {
      const { owner, productionId, folder } = await setupPaidBlog();
      const buyer = await createTestUser(models);
      const ticket = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );
      const purchase = await tickets.purchaseProductionTicket(
        { ticketId: ticket._id, acceptNoRefund: true },
        buyer,
      );

      await expect(
        tickets.rejectProductionTicketPurchase(purchase._id, 'No llegó', buyer),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const rejected = await tickets.rejectProductionTicketPurchase(
        purchase._id,
        'No se encontró la transferencia',
        owner,
      );
      expect(rejected.status).toBe(ProductionTicketPurchaseStatus.rejected);
      expect(rejected.statusReason).toBe('No se encontró la transferencia');
      await expect(
        tickets.activateProductionTicketPurchase(purchase._id, owner),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        tickets.purchaseProductionTicket(
          { ticketId: ticket._id, acceptNoRefund: true },
          buyer,
        ),
      ).resolves.toBeDefined();
    });

    it('un ticket gratuito habilita en el momento y no exige reseña', async () => {
      const { owner, productionId, folder, photo } = await setupPaidBlog();
      const visitor = await createTestUser(models);
      const ticket = await tickets.createProductionTicket(
        { productionId, targetId: folder._id, isPaid: false, durationHours: 48 },
        owner,
      );

      const purchase = await tickets.purchaseProductionTicket(
        { ticketId: ticket._id, acceptNoRefund: false },
        visitor,
      );
      expect(purchase.status).toBe(ProductionTicketPurchaseStatus.active);
      expect(purchase.reviewRequired).toBe(false);
      expect(purchase.commissionStatus).toBe(
        ProductionCommissionStatus.notApplicable,
      );
      expect(purchase.commissionPaymentInstructions).toBeNull();
      expect((await service.getProductionItemById(photo._id, visitor)).key).toBe(
        'key-premium',
      );
    });
  });

  describe('Herencia, override y toggle (TKT-01/02)', () => {
    it('una subcarpeta con ticket propio no se habilita con el de la carpeta', async () => {
      const { owner, productionId, folder, vip, vipPhoto, photo } =
        await setupPaidBlog();
      const buyer = await createTestUser(models);
      const folderTicket = await tickets.createProductionTicket(
        { productionId, targetId: folder._id, isPaid: false, untilClose: true },
        owner,
      );
      await tickets.createProductionTicket(paidTicket(productionId, vip._id, 5000), owner);

      await tickets.purchaseProductionTicket(
        { ticketId: folderTicket._id, acceptNoRefund: false },
        buyer,
      );

      expect((await service.getProductionItemById(photo._id, buyer)).key).toBe(
        'key-premium',
      );
      const vipDetail = await service.getProductionItemById(vipPhoto._id, buyer);
      expect(vipDetail.key).toBeNull();
      expect(vipDetail.access.ticket?.price).toBe(5000);
    });

    it('el toggle cambia toda la carpeta de pago a gratuito (TKT-02)', async () => {
      const { owner, productionId, folder, vipPhoto } = await setupPaidBlog();
      const visitor = await createTestUser(models);
      const ticket = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );

      const toggled = await tickets.updateProductionTicket(
        ticket._id,
        { isPaid: false },
        owner,
      );
      expect(toggled.isPaid).toBe(false);
      expect(toggled.price).toBe(0);
      const detail = await service.getProductionItemById(vipPhoto._id, visitor);
      expect(detail.access.ticket).toMatchObject({ isPaid: false });
    });

    it('recrear el ticket de una carpeta no le quita el acceso al comprador', async () => {
      const { owner, productionId, folder, photo } = await setupPaidBlog();
      const buyer = await createTestUser(models);
      const ticket = await tickets.createProductionTicket(
        { productionId, targetId: folder._id, isPaid: false, untilClose: true },
        owner,
      );
      await tickets.purchaseProductionTicket(
        { ticketId: ticket._id, acceptNoRefund: false },
        buyer,
      );

      await tickets.deleteProductionTicket(ticket._id, owner);
      await tickets.createProductionTicket(paidTicket(productionId, folder._id), owner);

      expect((await service.getProductionItemById(photo._id, buyer)).key).toBe(
        'key-premium',
      );
    });

    it('el staff ve el contenido sin ticket', async () => {
      const { owner, productionId, folder, photo } = await setupPaidBlog();
      await tickets.createProductionTicket(paidTicket(productionId, folder._id), owner);
      expect((await service.getProductionItemById(photo._id, owner)).key).toBe(
        'key-premium',
      );
    });
  });

  describe('Reglas de compra', () => {
    it('no se compra sin la clave de un blog protegido ni lo que no se ve', async () => {
      const { owner, productionId, folder } = await setupPaidBlog();
      const buyer = await createTestUser(models);
      const ticket = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );
      await service.setProductionAccessKey(productionId, 'clave-blog', owner);

      await expect(
        tickets.purchaseProductionTicket(
          { ticketId: ticket._id, acceptNoRefund: true },
          buyer,
        ),
      ).rejects.toThrow('clave del blog');

      await service.setProductionAccessKey(productionId, null, owner);
      await service.setProductionItemVisibility(folder._id, 'topfriends' as any, owner);
      await expect(
        tickets.getProductionTicketCheckout(ticket._id, buyer),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('el dueño no compra su propio ticket', async () => {
      const { owner, productionId, folder } = await setupPaidBlog();
      const ticket = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );
      await expect(
        tickets.purchaseProductionTicket(
          { ticketId: ticket._id, acceptNoRefund: true },
          owner,
        ),
      ).rejects.toThrow('Ya tenés acceso');
    });
  });

  describe('Cierre del blog y borrado de contenido (TKT-08, RNF-05)', () => {
    it('cerrar el blog cancela lo pendiente, vence lo activo y conserva los registros', async () => {
      const { owner, productionId, folder, vip } = await setupPaidBlog();
      const pendingBuyer = await createTestUser(models);
      const activeBuyer = await createTestUser(models);
      const folderTicket = await tickets.createProductionTicket(
        paidTicket(productionId, folder._id),
        owner,
      );
      await tickets.createProductionTicket(paidTicket(productionId, vip._id), owner);

      await tickets.purchaseProductionTicket(
        { ticketId: folderTicket._id, acceptNoRefund: true },
        pendingBuyer,
      );
      const active = await tickets.purchaseProductionTicket(
        { ticketId: folderTicket._id, acceptNoRefund: true },
        activeBuyer,
      );
      await tickets.activateProductionTicketPurchase(active._id, owner);
      await models.connection
        .collection('productionticketpurchases')
        .updateOne(
          { _id: new Types.ObjectId(active._id) },
          { $set: { firstAccessAt: new Date() } },
        );

      await service.deleteProduction(productionId, owner);

      expect(
        await models.connection.collection('productiontickets').countDocuments(),
      ).toBe(0);
      const purchases = await tickets.getProductionTicketPurchasesAdmin(undefined, 1, 10);
      expect(purchases.total).toBe(2);
      const byBuyer = new Map(purchases.purchases.map((p) => [p.buyer, p]));
      expect(byBuyer.get(pendingBuyer)!.status).toBe(
        ProductionTicketPurchaseStatus.cancelled,
      );
      expect(byBuyer.get(activeBuyer)!.status).toBe(
        ProductionTicketPurchaseStatus.expired,
      );
      expect(byBuyer.get(activeBuyer)!.reviewRequired).toBe(false);
      expect(byBuyer.get(activeBuyer)!.productionTitle).toBe('Blog pago');
    });

    it('borrar una carpeta borra sus tickets y cierra sus compras', async () => {
      const { owner, productionId, folder, vip } = await setupPaidBlog();
      const buyer = await createTestUser(models);
      const vipTicket = await tickets.createProductionTicket(
        { productionId, targetId: vip._id, isPaid: false, untilClose: true },
        owner,
      );
      await tickets.createProductionTicket(
        { productionId, isPaid: false, untilClose: true },
        owner,
      );
      await tickets.purchaseProductionTicket(
        { ticketId: vipTicket._id, acceptNoRefund: false },
        buyer,
      );

      await service.deleteItem(folder._id, ProductionItemKind.folder, owner);

      const remaining = await tickets.getProductionTickets(productionId, owner);
      expect(remaining.map((t) => t.target)).toEqual([null]);
      const mine = await tickets.getMyProductionTicketPurchases(buyer, undefined, 1, 10);
      expect(mine.purchases[0].status).toBe(ProductionTicketPurchaseStatus.expired);
    });
  });
});
