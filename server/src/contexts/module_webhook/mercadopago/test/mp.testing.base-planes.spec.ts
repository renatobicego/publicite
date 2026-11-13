import mongoose, { Connection, Model, Types } from 'mongoose';
import { TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

import mpTestingModule from './test.module';
import { IUser, UserModel } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { SubscriptionDocument } from '../infastructure/schemas/subscription.schema';
import { SubscriptionPlanDocument } from '../infastructure/schemas/subscriptionPlan.schema';
import { MpSubscriptionService } from '../application/service/mp-subscription.service';
import { MpCheckoutService } from '../application/service/mp-checkout.service';
import { MpHandlerEvents } from '../infastructure/adapters/handler/mpHandlerFETCHEvents';
import { MercadoPagoApiError } from '../application/adapter/out/mercadopago.api.error';
import { get_subscription_preapproval } from './models/subscription.creator';
import { createPersonalUser } from '../../../../../test/functions_unit_testing/user/create.user';

/*
Fase 1 del plan de Hacete Amigo / cambio de plan / packs / regalos, contra la base:
- qué suscripciones están activas (con vencimiento y titulares por User.subscriptions);
- alta idempotente y preapprovals que no son de un usuario;
- checkout, cambio de plan, cancelación y tarjeta hechos por el server.
MercadoPago está mockeado; todo lo que se crea lleva el prefijo `fase1_`.
*/

const PLAN_MP = {
  free: 'fase1_plan_free',
  premium: 'fase1_plan_premium',
  gold: 'fase1_plan_gold',
  pack: 'fase1_plan_pack',
  tokens: 'fase1_plan_pack_tokens',
} as const;
type PlanKey = keyof typeof PLAN_MP;

const FUTURE = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 24 * 60 * 60 * 1000);

describe('Fase 1 - base común de suscripciones', () => {
  let connection: Connection;
  let userModel: Model<IUser>;
  let subscriptionModel: Model<SubscriptionDocument>;
  let planModel: Model<SubscriptionPlanDocument>;
  let errorModel: Model<any>;
  let subscriptionService: MpSubscriptionService;
  let checkout: MpCheckoutService;
  let handler: MpHandlerEvents;
  let userService: any;
  let fetchMock: any;
  let userId: Types.ObjectId;
  let uid: string;
  const planIds = {} as Record<PlanKey, Types.ObjectId>;

  beforeAll(async () => {
    connection = mongoose.connection;
    const moduleRef: TestingModule = await mpTestingModule.get('mp_testing_module')();
    userModel = moduleRef.get(getModelToken(UserModel.modelName));
    subscriptionModel = moduleRef.get(getModelToken('Subscription'));
    planModel = moduleRef.get(getModelToken('SubscriptionPlan'));
    errorModel = moduleRef.get(getModelToken('Error'));
    subscriptionService = moduleRef.get('SubscriptionServiceInterface');
    checkout = moduleRef.get('MpCheckoutServiceInterface');
    handler = moduleRef.get('MpHandlerEventsInterface');
    userService = moduleRef.get('UserServiceInterface');

    await planModel.deleteMany({ mpPreapprovalPlanId: { $in: Object.values(PLAN_MP) } });
    const base = {
      isActive: true,
      description: 'Fase 1 TEST',
      features: ['TEST'],
      intervalTime: 30,
      price: 0,
    };
    const definitions: [PlanKey, Record<string, any>][] = [
      ['free', { isFree: true, isPack: false, postsLibresCount: 1, postsAgendaCount: 1, maxContacts: 5 }],
      ['premium', { isFree: false, isPack: false, postsLibresCount: 5, postsAgendaCount: 5, maxContacts: 20 }],
      ['gold', { isFree: false, isPack: false, postsLibresCount: 20, postsAgendaCount: 20, maxContacts: 50 }],
      ['pack', { isFree: false, isPack: true, postsLibresCount: 5, postsAgendaCount: 5, maxContacts: 0 }],
      // Un pack de tokens sólo trae lo que suma: sin anuncios ni contactos.
      ['tokens', { isFree: false, isPack: true, tokensCount: 5000 }],
    ];
    for (const [key, fields] of definitions) {
      const _id = new Types.ObjectId();
      await planModel.create({
        _id,
        mpPreapprovalPlanId: PLAN_MP[key],
        reason: `Fase1 ${key}`,
        ...base,
        ...fields,
      });
      planIds[key] = _id;
    }
  });

  beforeEach(async () => {
    userId = new Types.ObjectId();
    uid = userId.toString();
    await createPersonalUser(userModel, { _id: userId });
    fetchMock = {
      getDataFromMp_fetch: jest.fn(),
      changeSubscriptionStatusInMercadopago_fetch: jest.fn(),
      createPreapproval: jest.fn(),
      updatePreapproval: jest.fn(),
    };
    (checkout as any).fetchToMp = fetchMock;
    (handler as any).fetchToMpAdapter = fetchMock;
  });

  afterEach(async () => {
    await subscriptionModel.deleteMany({ mpPreapprovalId: /^fase1_/ });
    await errorModel.deleteMany({ user: uid });
    await userModel.deleteOne({ _id: userId });
  });

  afterAll(async () => {
    await planModel.deleteMany({ _id: { $in: Object.values(planIds) } });
    await connection.close();
  });

  async function addSubscription(planKey: PlanKey, extra: Record<string, any> = {}) {
    const doc = await subscriptionModel.create({
      mpPreapprovalId: `fase1_${new Types.ObjectId().toString()}`,
      payerId: '1',
      status: 'authorized',
      subscriptionPlan: planIds[planKey],
      startDate: '2026-11-01',
      endDate: '2026-12-01',
      external_reference: uid,
      payerUser: userId,
      ...extra,
    });
    await userModel.updateOne({ _id: userId }, { $addToSet: { subscriptions: doc._id } });
    return doc;
  }

  const addFree = () => addSubscription('free', { external_reference: 'FREE', payerUser: undefined });

  function mockMp(planMpId: string, preapprovalId: string, options: { noReference?: boolean } = {}) {
    fetchMock.getDataFromMp_fetch.mockImplementation(async (url: string) => {
      if (url.includes('preapproval_plan/')) {
        return {
          id: planMpId,
          status: 'active',
          reason: 'Fase1 desde MP',
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 1250,
            currency_id: 'ARS',
          },
        };
      }
      const preapproval: any = get_subscription_preapproval(uid, planMpId, false);
      preapproval.id = preapprovalId;
      preapproval.status = 'authorized';
      // MP no siempre devuelve el external_reference
      if (options.noReference) preapproval.external_reference = undefined;
      return preapproval;
    });
    fetchMock.createPreapproval.mockResolvedValue({ id: preapprovalId, status: 'authorized' });
  }

  const command = (mpPreapprovalPlanId: string, replacesSubscriptionId?: string) => ({
    mpPreapprovalPlanId,
    cardTokenId: 'tok_test',
    payerEmail: 'pagador@test.com',
    replacesSubscriptionId,
  });

  describe('suscripciones activas', () => {
    it('ve las del usuario por User.subscriptions y saca las vencidas', async () => {
      await addFree();
      await addSubscription('premium', { kind: 'carryover', expiresAt: FUTURE });
      await addSubscription('gold', { kind: 'gift', expiresAt: PAST });
      await addSubscription('pack');

      const active = await subscriptionService.getActiveSubscriptions(uid);
      expect(active.map((s: any) => s.subscriptionPlan.mpPreapprovalPlanId).sort()).toEqual(
        [PLAN_MP.free, PLAN_MP.pack, PLAN_MP.premium].sort(),
      );
      // El extra temporal y el pack no son "un plan pago"
      expect(await subscriptionService.hasPaidPlan(uid)).toBe(false);
      // pero sí cuentan para no bajarle el plan ante un rechazo
      expect(await subscriptionService.getActivePaidSubscriptions(uid)).toHaveLength(2);

      await addSubscription('gold', { kind: 'gift', expiresAt: FUTURE });
      expect(await subscriptionService.hasPaidPlan(uid)).toBe(true);
    });

    it('el límite de contactos suma sólo las activas y un pack de tokens no lo rompe', async () => {
      await addFree(); // 5
      await addSubscription('premium', { kind: 'carryover', expiresAt: FUTURE }); // 20
      await addSubscription('gold', { kind: 'gift', expiresAt: PAST }); // vencida
      await addSubscription('tokens'); // sin maxContacts

      expect(await userService.getLimitContactsFromUserByUserId(uid)).toBe(25);
    });

    it('el historial deja afuera las canceladas y las vencidas', async () => {
      await addFree();
      const premium = await addSubscription('premium');
      await addSubscription('gold', { kind: 'gift', expiresAt: PAST });
      await addSubscription('pack', { status: 'cancelled' });

      const history: any[] = await subscriptionService.getSubscriptionHistory(uid);
      expect(history.map((s: any) => s.mpPreapprovalId)).toEqual([premium.mpPreapprovalId]);
    });

    it('al borrar la cuenta sólo se cancelan en MP las que tienen preapproval', async () => {
      const premium = await addSubscription('premium');
      await addSubscription('premium', { kind: 'carryover', expiresAt: FUTURE });
      await addSubscription('gold', { kind: 'gift', expiresAt: FUTURE });

      const toCancel = await subscriptionService.getActiveMpSubscriptionsPaidBy(uid);
      expect(toCancel.map((s: any) => s.mpPreapprovalId)).toEqual([premium.mpPreapprovalId]);
    });
  });

  describe('alta desde el webhook', () => {
    it('es idempotente: un reintento no duplica ni falla', async () => {
      const preapproval: any = get_subscription_preapproval(uid, PLAN_MP.premium, false);
      preapproval.id = `fase1_${new Types.ObjectId().toString()}`;
      preapproval.status = 'authorized';

      await subscriptionService.createSubscription_preapproval(preapproval);
      await subscriptionService.createSubscription_preapproval(preapproval);

      expect(await subscriptionModel.countDocuments({ mpPreapprovalId: preapproval.id })).toBe(1);
      const saved: any = await subscriptionModel.findOne({ mpPreapprovalId: preapproval.id }).lean();
      expect(saved.kind).toBe('mp');
      expect(saved.payerUser.toString()).toBe(uid);
      const user: any = await userModel.findById(userId).select('subscriptions').lean();
      const own = user.subscriptions.filter((id: any) => id.toString() === saved._id.toString());
      expect(own).toHaveLength(1);
    });

    it('un preapproval de Hacete Amigo no se registra como suscripción de un usuario', async () => {
      const preapproval: any = get_subscription_preapproval(
        `friendGroup:${new Types.ObjectId().toString()}`,
        PLAN_MP.premium,
        false,
      );
      preapproval.id = `fase1_${new Types.ObjectId().toString()}`;
      preapproval.status = 'authorized';
      fetchMock.getDataFromMp_fetch.mockResolvedValue(preapproval);

      // Antes terminaba en "Plan not found" o en un usuario inexistente, y MP reintentaba sin fin.
      await expect(handler.update_subscription_preapproval(preapproval.id)).resolves.toBe(true);
      expect(await subscriptionModel.countDocuments({ mpPreapprovalId: preapproval.id })).toBe(0);
    });
  });

  describe('checkout por el server', () => {
    it('da de alta el plan con el monto de MP y lo registra en el momento', async () => {
      await addFree();
      mockMp(PLAN_MP.premium, 'fase1_pre_alta', { noReference: true });

      const result = await checkout.startSubscriptionCheckout(uid, command(PLAN_MP.premium));

      expect(result).toEqual({
        mpPreapprovalId: 'fase1_pre_alta',
        status: 'authorized',
        registered: true,
        previousSubscriptionCancelled: null,
        warning: null,
      });
      const body = fetchMock.createPreapproval.mock.calls[0][0];
      expect(body.external_reference).toBe(uid);
      expect(body.auto_recurring.transaction_amount).toBe(1250);
      expect(body.card_token_id).toBe('tok_test');
      expect(body.preapproval_plan_id).toBe(PLAN_MP.premium);

      const saved: any = await subscriptionModel.findOne({ mpPreapprovalId: 'fase1_pre_alta' }).lean();
      expect(saved.payerUser.toString()).toBe(uid);
      expect(saved.external_reference).toBe(uid);
      expect(saved.subscriptionPlan.toString()).toBe(planIds.premium.toString());
      const user: any = await userModel.findById(userId).select('subscriptions').lean();
      expect(user.subscriptions.map((id: any) => id.toString())).toContain(saved._id.toString());
    });

    it('no deja contratar un segundo plan ni el mismo pack dos veces', async () => {
      await addSubscription('premium');
      mockMp(PLAN_MP.gold, 'fase1_pre_gold');
      await expect(
        checkout.startSubscriptionCheckout(uid, command(PLAN_MP.gold)),
      ).rejects.toThrow(/Ya tenés un plan pago/);

      await addSubscription('pack');
      mockMp(PLAN_MP.pack, 'fase1_pre_pack');
      await expect(
        checkout.startSubscriptionCheckout(uid, command(PLAN_MP.pack)),
      ).rejects.toThrow('Ya tenés este pack activo.');

      // Otro pack distinto sí, aunque tenga un plan pago
      mockMp(PLAN_MP.tokens, 'fase1_pre_tokens');
      await expect(
        checkout.startSubscriptionCheckout(uid, command(PLAN_MP.tokens)),
      ).resolves.toMatchObject({ registered: true });
      expect(fetchMock.createPreapproval).toHaveBeenCalledTimes(1);
    });

    it('un plan dado de baja en MP no se puede contratar', async () => {
      fetchMock.getDataFromMp_fetch.mockResolvedValue({ status: 'cancelled' });
      await expect(
        checkout.startSubscriptionCheckout(uid, command(PLAN_MP.premium)),
      ).rejects.toThrow('Este plan no está disponible en este momento.');
      expect(fetchMock.createPreapproval).not.toHaveBeenCalled();
    });

    it('una tarjeta rechazada devuelve un mensaje claro y no guarda nada', async () => {
      mockMp(PLAN_MP.premium, 'fase1_pre_rechazada');
      fetchMock.createPreapproval.mockRejectedValue(
        new MercadoPagoApiError(400, { message: 'cc_rejected_other_reason' }),
      );

      await expect(
        checkout.startSubscriptionCheckout(uid, command(PLAN_MP.premium)),
      ).rejects.toThrow('La tarjeta fue rechazada');
      expect(await subscriptionModel.countDocuments({ mpPreapprovalId: 'fase1_pre_rechazada' })).toBe(0);
    });

    it('cambio de plan: da de alta el nuevo y cancela el anterior', async () => {
      const previous = await addSubscription('premium');
      mockMp(PLAN_MP.gold, 'fase1_pre_cambio');
      fetchMock.changeSubscriptionStatusInMercadopago_fetch.mockResolvedValue({});

      const result = await checkout.startSubscriptionCheckout(
        uid,
        command(PLAN_MP.gold, previous.mpPreapprovalId),
      );

      expect(result.previousSubscriptionCancelled).toBe(true);
      expect(result.warning).toBeNull();
      expect(fetchMock.changeSubscriptionStatusInMercadopago_fetch).toHaveBeenCalledWith(
        expect.any(String),
        previous.mpPreapprovalId,
        'cancelled',
      );
      const old: any = await subscriptionModel.findById(previous._id).lean();
      expect(old.status).toBe('cancelled');
    });

    it('cambio de plan: si MP no cancela el anterior, avisa y deja registro para el admin', async () => {
      const previous = await addSubscription('premium');
      mockMp(PLAN_MP.gold, 'fase1_pre_cambio_falla');
      fetchMock.changeSubscriptionStatusInMercadopago_fetch.mockRejectedValue(new Error('MP caído'));

      const result = await checkout.startSubscriptionCheckout(
        uid,
        command(PLAN_MP.gold, previous.mpPreapprovalId),
      );

      expect(result.registered).toBe(true);
      expect(result.previousSubscriptionCancelled).toBe(false);
      expect(result.warning).toMatch(/no pudimos dar de baja el anterior/);
      expect(fetchMock.changeSubscriptionStatusInMercadopago_fetch).toHaveBeenCalledTimes(2);
      const old: any = await subscriptionModel.findById(previous._id).lean();
      expect(old.status).toBe('authorized');
      expect(await errorModel.countDocuments({ user: uid, code: 'CHANGE_PLAN_CANCEL_FAILED' })).toBe(1);
    });

    it('no deja cambiar ni cancelar la suscripción de otro usuario', async () => {
      const other = new Types.ObjectId();
      const foreign = await subscriptionModel.create({
        mpPreapprovalId: `fase1_${new Types.ObjectId().toString()}`,
        payerId: '1',
        status: 'authorized',
        subscriptionPlan: planIds.premium,
        startDate: '2026-11-01',
        endDate: '2026-12-01',
        external_reference: other.toString(),
        payerUser: other,
      });
      mockMp(PLAN_MP.gold, 'fase1_pre_ajena');

      await expect(
        checkout.startSubscriptionCheckout(uid, command(PLAN_MP.gold, foreign.mpPreapprovalId)),
      ).rejects.toThrow('No encontramos el plan que querés cambiar.');
      await expect(checkout.cancelMySubscription(uid, foreign.mpPreapprovalId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(
        checkout.updateMySubscriptionCard(uid, foreign.mpPreapprovalId, 'tok_test'),
      ).rejects.toThrow(NotFoundException);
      expect(fetchMock.createPreapproval).not.toHaveBeenCalled();
      expect(fetchMock.changeSubscriptionStatusInMercadopago_fetch).not.toHaveBeenCalled();
      expect(fetchMock.updatePreapproval).not.toHaveBeenCalled();
    });

    it('cancela una suscripción propia en MP y en la base', async () => {
      const premium = await addSubscription('premium');
      fetchMock.changeSubscriptionStatusInMercadopago_fetch.mockResolvedValue({});

      await expect(checkout.cancelMySubscription(uid, premium.mpPreapprovalId)).resolves.toBe(true);

      const saved: any = await subscriptionModel.findById(premium._id).lean();
      expect(saved.status).toBe('cancelled');
    });

    it('cambia la tarjeta de una suscripción propia', async () => {
      const premium = await addSubscription('premium');
      fetchMock.updatePreapproval.mockResolvedValue({});

      await expect(
        checkout.updateMySubscriptionCard(uid, premium.mpPreapprovalId, 'tok_nueva'),
      ).resolves.toBe(true);
      expect(fetchMock.updatePreapproval).toHaveBeenCalledWith(premium.mpPreapprovalId, {
        card_token_id: 'tok_nueva',
      });
    });
  });
});
