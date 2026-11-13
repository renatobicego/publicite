import mongoose, { Connection, Model, Types } from 'mongoose';
import { TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { IUser, UserModel } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import {
  mp_gift_payment,
  plan_gift_notification,
  user_created,
} from 'src/contexts/module_shared/event-emmiter/events';
import { MpSubscriptionService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-subscription.service';
import { MercadoPagoApiError } from 'src/contexts/module_webhook/mercadopago/application/adapter/out/mercadopago.api.error';
import { PlanNotificationEvent } from 'src/contexts/module_user/notification/domain/entity/plan.events';
import { createPersonalUser } from '../../../../test/functions_unit_testing/user/create.user';
import { PlanGiftService } from '../planGift/application/service/plan-gift.service';
import { PlanGiftStatus } from '../planGift/domain/entity/plan-gift.types';
import { friendPlanTestingModule } from './friend-plan.test.module';

/*
Fase 4 del plan de Hacete Amigo / packs / regalos: regalo de planes con pago
único. MercadoPago está mockeado. Todo lo que se crea en la base lleva el prefijo
`giftTest_` (planes, pagos) o se borra por los ids de los usuarios del test.
*/

const PLAN_MP = {
  premium: 'giftTest_plan_premium',
  pack: 'giftTest_plan_pack',
  yearly: 'giftTest_plan_yearly',
} as const;
const MONTHLY_AMOUNT = 1000;

describe('Fase 4 - regalo de planes', () => {
  let connection: Connection;
  let moduleRef: TestingModule;
  let userModel: Model<IUser>;
  let subscriptionModel: Model<any>;
  let planModel: Model<any>;
  let giftModel: Model<any>;
  let invoiceModel: Model<any>;
  let service: PlanGiftService;
  let subscriptionService: MpSubscriptionService;
  let emitter: EmitterService;
  let fetchMock: any;
  let emitSpy: jest.SpyInstance;
  let giverId: Types.ObjectId;
  let recipientId: Types.ObjectId;
  let giver: string;
  let recipient: string;
  let recipientEmail: string;
  let paymentCounter = 0;
  const planIds: Record<string, Types.ObjectId> = {};
  const extraUsers: Types.ObjectId[] = [];

  beforeAll(async () => {
    connection = mongoose.connection;
    moduleRef = await friendPlanTestingModule();
    // Los @OnEvent se registran al iniciar el módulo.
    await moduleRef.init();
    userModel = moduleRef.get(getModelToken(UserModel.modelName));
    subscriptionModel = moduleRef.get(getModelToken('Subscription'));
    planModel = moduleRef.get(getModelToken('SubscriptionPlan'));
    giftModel = moduleRef.get(getModelToken('PlanGift'));
    invoiceModel = moduleRef.get(getModelToken('Invoice'));
    service = moduleRef.get(PlanGiftService);
    subscriptionService = moduleRef.get('SubscriptionServiceInterface');
    emitter = moduleRef.get(EmitterService);

    await planModel.deleteMany({ mpPreapprovalPlanId: { $in: Object.values(PLAN_MP) } });
    const base = {
      isActive: true,
      description: 'Regalos TEST',
      features: ['TEST'],
      price: 0,
      isFree: false,
      postsLibresCount: 5,
      postsAgendaCount: 5,
      maxContacts: 20,
    };
    const definitions: [keyof typeof PLAN_MP, Record<string, any>][] = [
      ['premium', { isPack: false, intervalTime: 30 }],
      ['pack', { isPack: true, intervalTime: 30 }],
      ['yearly', { isPack: false, intervalTime: 365 }],
    ];
    for (const [key, fields] of definitions) {
      const _id = new Types.ObjectId();
      await planModel.create({
        _id,
        mpPreapprovalPlanId: PLAN_MP[key],
        reason: `Regalo ${key}`,
        ...base,
        ...fields,
      });
      planIds[key] = _id;
    }
  });

  beforeEach(async () => {
    giverId = new Types.ObjectId();
    recipientId = new Types.ObjectId();
    giver = giverId.toString();
    recipient = recipientId.toString();
    recipientEmail = `gifttest_${recipient}@example.com`;
    await createPersonalUser(userModel, {
      _id: giverId,
      email: `gifttest_${giver}@example.com`,
      username: `gifttest_${giver}`,
    });
    await createPersonalUser(userModel, {
      _id: recipientId,
      email: recipientEmail,
      username: `gifttest_${recipient}`,
    });

    fetchMock = {
      getDataFromMp_fetch: jest.fn(async () => ({
        status: 'active',
        auto_recurring: { transaction_amount: MONTHLY_AMOUNT },
      })),
      createPayment: jest.fn(),
    };
    (service as any).fetchToMp = fetchMock;
    emitSpy = jest.spyOn(emitter, 'emitAsync');
  });

  afterEach(async () => {
    emitSpy.mockRestore();
    const users = [giverId, recipientId, ...extraUsers.splice(0)];
    const gifts = await giftModel.find({ giver: { $in: users } }).lean<any[]>();
    const giftRefs = gifts.map((gift) => `gift:${gift._id}`);
    await subscriptionModel.deleteMany({ mpPreapprovalId: { $in: giftRefs } });
    await subscriptionModel.deleteMany({ mpPreapprovalId: /^giftTest_/ });
    await giftModel.deleteMany({ giver: { $in: users } });
    await invoiceModel.deleteMany({ invoice_id: /^giftTest_/ });
    await userModel.deleteMany({ _id: { $in: users } });
  });

  afterAll(async () => {
    await planModel.deleteMany({ _id: { $in: Object.values(planIds) } });
    await moduleRef.close();
    await connection.close();
  });

  function payment(status: string, extra: Record<string, any> = {}) {
    paymentCounter += 1;
    return {
      id: `giftTest_${Date.now()}_${paymentCounter}`,
      status,
      status_detail: status === 'approved' ? 'accredited' : 'cc_rejected_other_reason',
      transaction_amount: MONTHLY_AMOUNT * 3,
      currency_id: 'ARS',
      ...extra,
    };
  }

  function buyInput(extra: Record<string, any> = {}) {
    return {
      mpPreapprovalPlanId: PLAN_MP.premium,
      months: 3,
      cardTokenId: 'tok_test',
      paymentMethodId: 'visa',
      payerEmail: 'quienpaga@example.com',
      ...extra,
    } as any;
  }

  function planNotifications(event: PlanNotificationEvent) {
    return emitSpy.mock.calls.filter(
      ([name, payload]) => name === plan_gift_notification && payload?.event === event,
    );
  }

  async function givePaidGiftToAccount() {
    fetchMock.createPayment.mockImplementation(async (body: any) =>
      payment('approved', { external_reference: body.external_reference }),
    );
    return service.buy(giver, buyInput({ recipientUserId: recipient }));
  }

  async function addPaidPlanTo(userId: Types.ObjectId) {
    const doc = await subscriptionModel.create({
      mpPreapprovalId: `giftTest_${new Types.ObjectId().toString()}`,
      payerId: '1',
      status: 'authorized',
      subscriptionPlan: planIds.premium,
      startDate: '2026-11-01',
      endDate: '2026-12-01',
      external_reference: userId.toString(),
      payerUser: userId,
    });
    await userModel.updateOne({ _id: userId }, { $addToSet: { subscriptions: doc._id } });
  }

  describe('cotización', () => {
    it('cobra el precio mensual de MP por la cantidad de meses', async () => {
      const quote = await service.getQuote(PLAN_MP.premium, 5);
      expect(quote.amount).toBe(MONTHLY_AMOUNT * 5);
      expect(quote.planReason).toBe('Regalo premium');
      expect(quote.monthOptions).toEqual([1, 2, 3, 5]);
    });

    it('rechaza meses fuera de las opciones', async () => {
      await expect(service.getQuote(PLAN_MP.premium, 4)).rejects.toThrow(BadRequestException);
    });

    it('no regala packs ni planes que no son mensuales', async () => {
      await expect(service.getQuote(PLAN_MP.pack, 1)).rejects.toThrow('no se puede regalar');
      await expect(service.getQuote(PLAN_MP.yearly, 1)).rejects.toThrow('no se puede regalar');
    });

    it('no regala un plan que MP tiene cancelado', async () => {
      fetchMock.getDataFromMp_fetch.mockResolvedValue({
        status: 'cancelled',
        auto_recurring: { transaction_amount: MONTHLY_AMOUNT },
      });
      await expect(service.getQuote(PLAN_MP.premium, 1)).rejects.toThrow('no está disponible');
    });
  });

  describe('compra', () => {
    it('regalo a una cuenta: cobra una vez el total, queda pagado y le avisa', async () => {
      const result = await givePaidGiftToAccount();

      expect(fetchMock.createPayment).toHaveBeenCalledTimes(1);
      const [body, idempotencyKey] = fetchMock.createPayment.mock.calls[0];
      expect(body.transaction_amount).toBe(MONTHLY_AMOUNT * 3);
      expect(body.external_reference).toBe(`gift:${result.giftId}`);
      expect(idempotencyKey).toBe(result.giftId);

      expect(result.status).toBe(PlanGiftStatus.paid);
      expect(result.recipientHasAccount).toBe(true);
      expect(result.link).toContain(`/canjear/${result.code}`);

      const gift = await giftModel.findById(result.giftId).lean<any>();
      expect(String(gift.recipient)).toBe(recipient);
      expect(gift.amount).toBe(MONTHLY_AMOUNT * 3);

      const invoice = await invoiceModel.findOne({ invoice_id: gift.mpPaymentId }).lean<any>();
      expect(invoice.external_reference).toBe(giver);

      const received = planNotifications(PlanNotificationEvent.giftReceived);
      expect(received).toHaveLength(1);
      expect(received[0][1].recipients).toEqual([{ userId: recipient }]);
    });

    it('regalo a un email con cuenta: va a esa cuenta', async () => {
      fetchMock.createPayment.mockImplementation(async (body: any) =>
        payment('approved', { external_reference: body.external_reference }),
      );
      const result = await service.buy(
        giver,
        buyInput({ recipientEmail: recipientEmail.toUpperCase() }),
      );
      expect(result.recipientHasAccount).toBe(true);
      const gift = await giftModel.findById(result.giftId).lean<any>();
      expect(String(gift.recipient)).toBe(recipient);
    });

    it('regalo a un email sin cuenta: queda reservado a ese email', async () => {
      fetchMock.createPayment.mockImplementation(async (body: any) =>
        payment('approved', { external_reference: body.external_reference }),
      );
      const result = await service.buy(giver, buyInput({ recipientEmail: 'Nadie.Todavia@Example.com' }));
      expect(result.recipientHasAccount).toBe(false);
      const gift = await giftModel.findById(result.giftId).lean<any>();
      expect(gift.recipient).toBeNull();
      expect(gift.recipientEmail).toBe('nadie.todavia@example.com');
      expect(planNotifications(PlanNotificationEvent.giftReceived)).toHaveLength(0);
    });

    it('no se regala a uno mismo ni a quien ya tiene plan, y no cobra', async () => {
      await expect(service.buy(giver, buyInput({ recipientUserId: giver }))).rejects.toThrow(
        'a vos mismo',
      );
      await addPaidPlanTo(recipientId);
      await expect(service.buy(giver, buyInput({ recipientUserId: recipient }))).rejects.toThrow(
        'ya tiene un plan',
      );
      expect(fetchMock.createPayment).not.toHaveBeenCalled();
    });

    it('pago rechazado: el regalo queda rechazado y avisa el motivo', async () => {
      fetchMock.createPayment.mockImplementation(async (body: any) =>
        payment('rejected', {
          external_reference: body.external_reference,
          status_detail: 'cc_rejected_insufficient_amount',
        }),
      );
      await expect(service.buy(giver, buyInput({ recipientUserId: recipient }))).rejects.toThrow(
        BadRequestException,
      );
      const gift = await giftModel.findOne({ giver: giverId }).lean<any>();
      expect(gift.status).toBe(PlanGiftStatus.rejected);
    });

    it('MP falla: el regalo queda rechazado y el error llega al usuario', async () => {
      fetchMock.createPayment.mockRejectedValue(
        new MercadoPagoApiError(400, { message: 'Invalid card token' }),
      );
      await expect(service.buy(giver, buyInput({ recipientUserId: recipient }))).rejects.toThrow();
      const gift = await giftModel.findOne({ giver: giverId }).lean<any>();
      expect(gift.status).toBe(PlanGiftStatus.rejected);
    });

    it('pago pendiente: se aprueba por webhook (idempotente) y avisa una sola vez', async () => {
      let pending: any;
      fetchMock.createPayment.mockImplementation(async (body: any) => {
        pending = payment('in_process', { external_reference: body.external_reference });
        return pending;
      });
      const result = await service.buy(giver, buyInput({ recipientUserId: recipient }));
      expect(result.status).toBe(PlanGiftStatus.pendingPayment);

      const approved = { ...pending, status: 'approved', status_detail: 'accredited' };
      // El webhook lo pasa por evento; dos veces el mismo pago no avisa dos veces.
      await emitter.emitAsync(mp_gift_payment, { giftId: result.giftId, payment: approved });
      await emitter.emitAsync(mp_gift_payment, { giftId: result.giftId, payment: approved });

      const gift = await giftModel.findById(result.giftId).lean<any>();
      expect(gift.status).toBe(PlanGiftStatus.paid);
      expect(planNotifications(PlanNotificationEvent.giftReceived)).toHaveLength(1);
      expect(await invoiceModel.countDocuments({ invoice_id: pending.id })).toBe(1);
    });
  });

  describe('asignación y canje', () => {
    async function giftToEmail(email: string) {
      fetchMock.createPayment.mockImplementation(async (body: any) =>
        payment('approved', { external_reference: body.external_reference }),
      );
      return service.buy(giver, buyInput({ recipientEmail: email }));
    }

    it('al registrarse con ese email el regalo aparece en su cuenta', async () => {
      const email = `nuevo_${giver}@example.com`;
      const result = await giftToEmail(email);

      const newUserId = new Types.ObjectId();
      extraUsers.push(newUserId);
      await createPersonalUser(userModel, {
        _id: newUserId,
        email,
        username: `gifttest_${newUserId}`,
      });
      await emitter.emitAsync(user_created, { userId: newUserId.toString(), email });

      const gift = await giftModel.findById(result.giftId).lean<any>();
      expect(String(gift.recipient)).toBe(newUserId.toString());
      expect(planNotifications(PlanNotificationEvent.giftReceived)).toHaveLength(1);
    });

    it('el link muestra datos mínimos y sólo le da el id a su destinatario', async () => {
      const email = `link_${giver}@example.com`;
      const result = await giftToEmail(email);

      const anonymous = await service.getByCode(result.code, null);
      expect(anonymous.availability).toBe('available');
      expect(anonymous.isForViewer).toBe(false);
      expect(anonymous.giftId).toBeNull();
      expect(anonymous.reservedForEmail).not.toBe(email);
      expect(anonymous.reservedForEmail).toContain('@example.com');

      const other = await service.getByCode(result.code, recipient);
      expect(other.isForViewer).toBe(false);
    });

    it('canje: lo toma la cuenta con el email reservado, no otra', async () => {
      const email = `canje_${giver}@example.com`;
      const result = await giftToEmail(email);

      await expect(service.claim(recipient, result.code)).rejects.toThrow(ForbiddenException);

      const ownerId = new Types.ObjectId();
      extraUsers.push(ownerId);
      await createPersonalUser(userModel, { _id: ownerId, email, username: `gifttest_${ownerId}` });
      const claimed = await service.claim(ownerId.toString(), result.code.toLowerCase());
      expect(claimed.canActivate).toBe(true);

      // Ya asignado: otra cuenta no lo puede tomar.
      await expect(service.claim(recipient, result.code)).rejects.toThrow('otra cuenta');
    });

    it('quien regala corrige el email mientras no tiene cuenta asignada', async () => {
      const result = await giftToEmail(`mal_${giver}@example.com`);
      const corrected = await service.updateEmail(giver, result.giftId, recipientEmail);
      expect(corrected.recipientName).not.toBeNull();
      const gift = await giftModel.findById(result.giftId).lean<any>();
      expect(String(gift.recipient)).toBe(recipient);
      expect(planNotifications(PlanNotificationEvent.giftReceived)).toHaveLength(1);

      // Ya está en una cuenta: no se cambia más.
      await expect(
        service.updateEmail(giver, result.giftId, `otro_${giver}@example.com`),
      ).rejects.toThrow('ya está en la cuenta');
      // Sólo quien regala.
      await expect(service.updateEmail(recipient, result.giftId, 'x@example.com')).rejects.toThrow();
    });
  });

  describe('activación', () => {
    it('crea un plan interno con vencimiento a N meses y le da los límites', async () => {
      const result = await givePaidGiftToAccount();
      const before = Date.now();
      const activated = await service.activate(recipient, result.giftId);

      expect(activated.status).toBe(PlanGiftStatus.active);
      const gift = await giftModel.findById(result.giftId).lean<any>();
      const subscription = await subscriptionModel
        .findOne({ mpPreapprovalId: `gift:${result.giftId}` })
        .lean<any>();
      expect(subscription.kind).toBe('gift');
      expect(String(subscription.payerUser)).toBe(giver);
      expect(String(subscription.subscriptionPlan)).toBe(planIds.premium.toString());
      const expected = new Date(before);
      expected.setMonth(expected.getMonth() + 3);
      expect(Math.abs(new Date(subscription.expiresAt).getTime() - expected.getTime())).toBeLessThan(
        60 * 1000,
      );
      expect(String(gift.subscription)).toBe(String(subscription._id));

      const user = await userModel.findById(recipientId).lean<any>();
      expect(user.subscriptions.map(String)).toContain(String(subscription._id));
      expect(await subscriptionService.hasPaidPlan(recipient)).toBe(true);
      // Quien regala no recibe el plan.
      expect(await subscriptionService.hasPaidPlan(giver)).toBe(false);

      const activatedNotice = planNotifications(PlanNotificationEvent.giftActivated);
      expect(activatedNotice).toHaveLength(1);
      expect(activatedNotice[0][1].recipients).toEqual([{ userId: giver }]);

      // Activar dos veces no crea otro plan.
      await service.activate(recipient, result.giftId);
      expect(
        await subscriptionModel.countDocuments({ mpPreapprovalId: `gift:${result.giftId}` }),
      ).toBe(1);
    });

    it('vencido deja de dar límites', async () => {
      const result = await givePaidGiftToAccount();
      await service.activate(recipient, result.giftId);
      await subscriptionModel.updateOne(
        { mpPreapprovalId: `gift:${result.giftId}` },
        { $set: { expiresAt: new Date(Date.now() - 1000) } },
      );
      expect(await subscriptionService.hasPaidPlan(recipient)).toBe(false);
    });

    it('sólo lo activa su destinatario, y no si ya tiene un plan', async () => {
      const result = await givePaidGiftToAccount();
      await expect(service.activate(giver, result.giftId)).rejects.toThrow('No encontramos');
      await addPaidPlanTo(recipientId);
      await expect(service.activate(recipient, result.giftId)).rejects.toThrow('Ya tenés un plan');
    });

    it('devolución de un regalo activo cancela su plan', async () => {
      const result = await givePaidGiftToAccount();
      await service.activate(recipient, result.giftId);
      const gift = await giftModel.findById(result.giftId).lean<any>();

      await service.handleMpPayment(result.giftId, {
        id: gift.mpPaymentId,
        status: 'refunded',
        status_detail: 'refunded',
        transaction_amount: gift.amount,
      });

      const after = await giftModel.findById(result.giftId).lean<any>();
      expect(after.status).toBe(PlanGiftStatus.refunded);
      expect(await subscriptionService.hasPaidPlan(recipient)).toBe(false);
    });
  });

  describe('consultas', () => {
    it('mis regalos: lo hecho y lo recibido; el email sólo lo ve quien regala', async () => {
      const result = await givePaidGiftToAccount();

      const mineAsGiver = await service.getMine(giver);
      expect(mineAsGiver.given.map((gift) => gift._id)).toContain(result.giftId);
      expect(mineAsGiver.given[0].recipientEmail).toBe(recipientEmail);
      expect(mineAsGiver.received).toHaveLength(0);

      const mineAsRecipient = await service.getMine(recipient);
      expect(mineAsRecipient.received.map((gift) => gift._id)).toContain(result.giftId);
      expect(mineAsRecipient.received[0].recipientEmail).toBeNull();
      expect(mineAsRecipient.received[0].canActivate).toBe(true);
    });
  });
});
