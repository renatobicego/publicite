import mongoose, { Connection, Model, Types } from 'mongoose';
import { TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import { IUser, UserModel } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import {
  downgrade_plan_contact,
  friend_group_notification,
  mp_friend_group_charge_failed,
  mp_friend_group_charge_recovered,
  mp_friend_group_preapproval,
  user_deleting,
} from 'src/contexts/module_shared/event-emmiter/events';
import { MpSubscriptionService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-subscription.service';
import { MercadoPagoApiError } from 'src/contexts/module_webhook/mercadopago/application/adapter/out/mercadopago.api.error';
import { PlanNotificationEvent } from 'src/contexts/module_user/notification/domain/entity/plan.events';
import { createPersonalUser } from '../../../../test/functions_unit_testing/user/create.user';
import { FriendGroupService } from '../friendGroup/application/service/friend-group.service';
import { FriendGroupStatus } from '../friendGroup/domain/entity/friend-group.types';
import { friendPlanTestingModule } from './friend-plan.test.module';

/*
Fase 5 del plan: Hacete Amigo (uno paga por todos un débito con descuento).
MercadoPago está mockeado. Los preapprovals de prueba llevan el prefijo
`fgTest_` y lo demás se borra por los ids de los usuarios del test.
*/

const PLAN_MP = { premium: 'fgTest_plan_premium', pack: 'fgTest_plan_pack' } as const;
const PLAN_AMOUNT = 1000;

describe('Fase 5 - Hacete Amigo', () => {
  let connection: Connection;
  let moduleRef: TestingModule;
  let userModel: Model<IUser>;
  let subscriptionModel: Model<any>;
  let planModel: Model<any>;
  let groupModel: Model<any>;
  let service: FriendGroupService;
  let subscriptionService: MpSubscriptionService;
  let emitter: EmitterService;
  let fetchMock: any;
  let emitSpy: jest.SpyInstance;
  let users: Types.ObjectId[];
  let preapprovalCounter = 0;
  const planIds: Record<string, Types.ObjectId> = {};

  beforeAll(async () => {
    connection = mongoose.connection;
    moduleRef = await friendPlanTestingModule();
    await moduleRef.init();
    userModel = moduleRef.get(getModelToken(UserModel.modelName));
    subscriptionModel = moduleRef.get(getModelToken('Subscription'));
    planModel = moduleRef.get(getModelToken('SubscriptionPlan'));
    groupModel = moduleRef.get(getModelToken('FriendGroup'));
    service = moduleRef.get(FriendGroupService);
    subscriptionService = moduleRef.get('SubscriptionServiceInterface');
    emitter = moduleRef.get(EmitterService);

    await planModel.deleteMany({ mpPreapprovalPlanId: { $in: Object.values(PLAN_MP) } });
    const base = {
      isActive: true,
      description: 'Hacete Amigo TEST',
      features: ['TEST'],
      price: 0,
      isFree: false,
      intervalTime: 30,
      postsLibresCount: 5,
      postsAgendaCount: 5,
      maxContacts: 20,
    };
    for (const [key, isPack] of [
      ['premium', false],
      ['pack', true],
    ] as const) {
      const _id = new Types.ObjectId();
      await planModel.create({
        _id,
        mpPreapprovalPlanId: PLAN_MP[key],
        reason: `Amigos ${key}`,
        isPack,
        ...base,
      });
      planIds[key] = _id;
    }
  });

  beforeEach(async () => {
    // A: crea; B, C: amigos (con un anuncio); D: sin publicar nada.
    users = [0, 1, 2, 3].map(() => new Types.ObjectId());
    for (const [index, _id] of users.entries()) {
      await createPersonalUser(userModel, {
        _id,
        email: `fgtest_${_id}@example.com`,
        username: `fgtest_${_id}`,
        name: `Amigo${'ABCD'[index]}`,
        lastName: 'Test',
        posts: index < 3 ? [new Types.ObjectId()] : [],
      });
    }
    fetchMock = {
      getDataFromMp_fetch: jest.fn(async () => ({
        status: 'active',
        auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: PLAN_AMOUNT },
      })),
      createPreapproval: jest.fn(async (body: any) => {
        preapprovalCounter += 1;
        return {
          id: `fgTest_pre_${Date.now()}_${preapprovalCounter}`,
          status: 'authorized',
          payer_id: 123,
          next_payment_date: new Date(Date.now() + 30 * 864e5).toISOString(),
          auto_recurring: body.auto_recurring,
        };
      }),
      changeSubscriptionStatusInMercadopago_fetch: jest.fn(async () => ({})),
    };
    (service as any).fetchToMp = fetchMock;
    emitSpy = jest.spyOn(emitter, 'emitAsync');
  });

  afterEach(async () => {
    emitSpy.mockRestore();
    await groupModel.deleteMany({ 'members.user': { $in: users } });
    await groupModel.deleteMany({ creator: { $in: users } });
    await subscriptionModel.deleteMany({ mpPreapprovalId: /^fgTest_/ });
    await userModel.deleteMany({ _id: { $in: users } });
  });

  afterAll(async () => {
    await planModel.deleteMany({ _id: { $in: Object.values(planIds) } });
    await moduleRef.close();
    await connection.close();
  });

  const id = (index: number) => users[index].toString();

  function notifications(event: PlanNotificationEvent) {
    return emitSpy.mock.calls.filter(
      ([name, payload]) => name === friend_group_notification && payload?.event === event,
    );
  }

  async function addPaidPlanTo(index: number) {
    const doc = await subscriptionModel.create({
      mpPreapprovalId: `fgTest_own_${new Types.ObjectId()}`,
      payerId: '1',
      status: 'authorized',
      subscriptionPlan: planIds.premium,
      startDate: '2026-11-01',
      endDate: '2026-12-01',
      external_reference: id(index),
      payerUser: users[index],
    });
    await userModel.updateOne({ _id: users[index] }, { $addToSet: { subscriptions: doc._id } });
  }

  /** Grupo de A con B y C aceptados (por link e invitación). */
  async function groupOfThree() {
    const created = await service.create(id(0), PLAN_MP.premium);
    await service.invite(id(0), created._id, id(1));
    await service.respondInvitation(id(1), created._id, true);
    const group = await groupModel.findById(created._id).lean<any>();
    await service.joinByInviteCode(id(2), group.inviteCode.toLowerCase());
    return created._id as string;
  }

  async function paidGroupOfThree() {
    const groupId = await groupOfThree();
    await service.pay(id(1), { groupId, cardTokenId: 'tok', payerEmail: 'paga@example.com' });
    return groupModel.findById(groupId).lean<any>();
  }

  describe('precios', () => {
    it('descuento por tramos, para planes pagos mensuales', async () => {
      const { plans, minMembers, maxMembers } = await service.getOptions();
      expect(minMembers).toBe(2);
      expect(maxMembers).toBe(0);
      const premium = plans.find((plan) => plan.mpPreapprovalPlanId === PLAN_MP.premium);
      expect(premium?.tiers).toEqual([
        { members: 2, discountPercent: 15, pricePerMember: 850, totalAmount: 1700 },
        { members: 3, discountPercent: 20, pricePerMember: 800, totalAmount: 2400 },
        { members: 4, discountPercent: 25, pricePerMember: 750, totalAmount: 3000 },
        { members: 5, discountPercent: 30, pricePerMember: 700, totalAmount: 3500 },
      ]);
      expect(plans.some((plan) => plan.mpPreapprovalPlanId === PLAN_MP.pack)).toBe(false);
    });

    it('no arma grupos con packs ni con planes que no son mensuales en MP', async () => {
      await expect(service.create(id(0), PLAN_MP.pack)).rejects.toThrow('no está disponible');
      fetchMock.getDataFromMp_fetch.mockResolvedValue({
        status: 'active',
        auto_recurring: { frequency: 12, frequency_type: 'months', transaction_amount: 10000 },
      });
      await expect(service.create(id(0), PLAN_MP.premium)).rejects.toThrow('no está disponible');
    });
  });

  describe('armar el grupo', () => {
    it('quien crea queda como primer miembro; invitar y aceptar avisa', async () => {
      const groupId = await groupOfThree();
      const { group } = await service.getMine(id(0));
      expect(group?._id).toBe(groupId);
      expect(group?.isCreator).toBe(true);
      expect(group?.members.map((member) => member.status)).toEqual([
        'accepted',
        'accepted',
        'accepted',
      ]);
      expect(group?.pricing).toMatchObject({ memberCount: 3, totalAmount: 2400 });
      expect(group?.nextTier).toMatchObject({ members: 4, pricePerMember: 750 });

      expect(notifications(PlanNotificationEvent.friendInvited)[0][1].recipients).toEqual([
        { userId: id(1) },
      ]);
      expect(notifications(PlanNotificationEvent.friendAccepted)).toHaveLength(2);
      expect(notifications(PlanNotificationEvent.friendReadyToPay).length).toBeGreaterThan(0);
    });

    it('el invitado ve la invitación y puede rechazarla', async () => {
      const created = await service.create(id(0), PLAN_MP.premium);
      await service.invite(id(0), created._id, id(1));
      const mine = await service.getMine(id(1));
      expect(mine.group).toBeNull();
      expect(mine.invitations).toHaveLength(1);
      expect(mine.invitations[0].invitedByName).toBe('AmigoA Test');
      expect(mine.invitations[0].tierIfJoins).toMatchObject({ members: 2, pricePerMember: 850 });

      const after = await service.respondInvitation(id(1), created._id, false);
      expect(after.invitations).toHaveLength(0);
      expect(notifications(PlanNotificationEvent.friendRejected)).toHaveLength(1);
    });

    it('quien tiene un plan pago o ya está en otro grupo no se suma', async () => {
      const created = await service.create(id(0), PLAN_MP.premium);
      await addPaidPlanTo(1);
      await service.invite(id(0), created._id, id(1));
      await expect(service.respondInvitation(id(1), created._id, true)).rejects.toThrow(
        'Primero cancelá tu plan actual',
      );
      await expect(service.create(id(1), PLAN_MP.premium)).rejects.toThrow(
        'Primero cancelá tu plan actual',
      );

      await service.create(id(2), PLAN_MP.premium);
      const group = await groupModel.findById(created._id).lean<any>();
      await expect(service.joinByInviteCode(id(2), group.inviteCode)).rejects.toThrow(
        'Ya estás en un grupo',
      );
    });

    it('link: regenerarlo invalida el anterior; sin sesión muestra datos mínimos', async () => {
      const created = await service.create(id(0), PLAN_MP.premium);
      const before = await groupModel.findById(created._id).lean<any>();

      const publicView = await service.getByInviteCode(before.inviteCode, null);
      expect(publicView).toMatchObject({
        planReason: 'Amigos premium',
        creatorName: 'AmigoA Test',
        acceptedCount: 1,
        availability: 'open',
        isMember: false,
      });
      expect(publicView.tierIfJoins).toMatchObject({ members: 2, pricePerMember: 850 });

      await expect(service.regenerateInviteCode(id(1), created._id)).rejects.toThrow();
      const regenerated = await service.regenerateInviteCode(id(0), created._id);
      expect(regenerated.inviteCode).not.toBe(before.inviteCode);
      await expect(service.joinByInviteCode(id(1), before.inviteCode)).rejects.toThrow(
        'no existe',
      );
    });

    it('si sale quien lo armó, el grupo pasa al que se sumó primero', async () => {
      const groupId = await groupOfThree();
      await service.leave(id(0), groupId);
      const group = await groupModel.findById(groupId).lean<any>();
      expect(String(group.creator)).toBe(id(1));
      expect(group.status).toBe(FriendGroupStatus.forming);
      expect(group.members).toHaveLength(2);
    });
  });

  describe('pagar', () => {
    it('no se paga con menos del mínimo ni si alguien no publicó nada', async () => {
      const created = await service.create(id(0), PLAN_MP.premium);
      await expect(service.getCheckout(id(0), created._id)).rejects.toThrow('invitá a 1 persona más');

      // Con invitaciones pendientes, lo que falta es que acepten.
      await service.invite(id(0), created._id, id(1));
      expect((await service.getMine(id(0))).group?.payBlockedReason).toBe(
        'Para pagar tienen que ser al menos 2 en el grupo: falta que tus invitados acepten la invitación.',
      );
      await service.removeMember(id(0), created._id, id(1));

      const group = await groupModel.findById(created._id).lean<any>();
      await service.joinByInviteCode(id(3), group.inviteCode);
      const mine = await service.getMine(id(0));
      expect(mine.group?.canPay).toBe(false);
      expect(mine.group?.payBlockedReason).toBe(
        'Falta que AmigoD Test publique un anuncio o una producción.',
      );
      await expect(service.getCheckout(id(0), created._id)).rejects.toThrow('AmigoD Test');

      // Una producción también cuenta.
      await userModel.updateOne(
        { _id: users[3] },
        { $set: { productions: [new Types.ObjectId()] } },
      );
      const checkout = await service.getCheckout(id(0), created._id);
      expect(checkout).toMatchObject({ memberCount: 2, discountPercent: 15, totalAmount: 1700 });
    });

    it('uno paga por todos: débito sin plan, una suscripción compartida para todos', async () => {
      const groupId = await groupOfThree();
      // D queda invitado sin aceptar: no entra al grupo pagado.
      await service.invite(id(0), groupId, id(3));

      const result = await service.pay(id(1), {
        groupId,
        cardTokenId: 'tok',
        payerEmail: 'paga@example.com',
      });
      expect(result.status).toBe(FriendGroupStatus.active);

      const body = fetchMock.createPreapproval.mock.calls[0][0];
      expect(body.preapproval_plan_id).toBeUndefined();
      expect(body.external_reference).toBe(`friendGroup:${groupId}`);
      expect(body.auto_recurring).toMatchObject({
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 2400,
      });

      const group = await groupModel.findById(groupId).lean<any>();
      expect(group).toMatchObject({
        status: FriendGroupStatus.active,
        memberCount: 3,
        discountPercent: 20,
        pricePerMember: 800,
        totalAmount: 2400,
      });
      expect(String(group.payer)).toBe(id(1));
      expect(group.members).toHaveLength(3);

      const subscription = await subscriptionModel
        .findOne({ mpPreapprovalId: group.mpPreapprovalId })
        .lean<any>();
      expect(subscription.kind).toBe('friendGroup');
      expect(String(subscription.payerUser)).toBe(id(1));
      for (const index of [0, 1, 2]) {
        expect(await subscriptionService.hasPaidPlan(id(index))).toBe(true);
      }
      expect(await subscriptionService.hasPaidPlan(id(3))).toBe(false);

      const active = notifications(PlanNotificationEvent.friendActive);
      expect(active).toHaveLength(1);
      expect(active[0][1].recipients).toEqual(
        expect.arrayContaining([
          { userId: id(1), isPayer: true },
          { userId: id(0), isPayer: false },
        ]),
      );

      // Pagado, queda fijo: nadie más se suma y no se paga dos veces.
      await expect(service.joinByInviteCode(id(3), group.inviteCode)).rejects.toThrow('cerrado');
      await expect(
        service.pay(id(0), { groupId, cardTokenId: 'tok', payerEmail: 'x@example.com' }),
      ).rejects.toThrow('ya está pagado');

      // El que paga ve el débito (para cambiar la tarjeta); los demás no.
      expect((await service.getMine(id(1))).group?.mpPreapprovalId).toBe(group.mpPreapprovalId);
      expect((await service.getMine(id(0))).group?.mpPreapprovalId).toBeNull();
    });

    it('si MP rechaza la tarjeta, el grupo vuelve a armarse', async () => {
      const groupId = await groupOfThree();
      fetchMock.createPreapproval.mockRejectedValue(
        new MercadoPagoApiError(400, { message: 'Card token invalid' }),
      );
      await expect(
        service.pay(id(1), { groupId, cardTokenId: 'tok', payerEmail: 'paga@example.com' }),
      ).rejects.toThrow();
      const group = await groupModel.findById(groupId).lean<any>();
      expect(group.status).toBe(FriendGroupStatus.forming);
      expect(group.payer).toBeNull();
      expect(group.totalAmount).toBeNull();
    });

    it('débito pendiente: se activa cuando MP lo autoriza (webhook)', async () => {
      const groupId = await groupOfThree();
      fetchMock.createPreapproval.mockImplementationOnce(async (body: any) => ({
        id: `fgTest_pending_${Date.now()}`,
        status: 'pending',
        auto_recurring: body.auto_recurring,
      }));
      const result = await service.pay(id(1), {
        groupId,
        cardTokenId: 'tok',
        payerEmail: 'paga@example.com',
      });
      expect(result.status).toBe(FriendGroupStatus.paying);
      expect(await subscriptionService.hasPaidPlan(id(0))).toBe(false);

      const group = await groupModel.findById(groupId).lean<any>();
      // Lo que hace el webhook: actualiza la suscripción y avisa al grupo.
      await subscriptionModel.updateOne(
        { mpPreapprovalId: group.mpPreapprovalId },
        { $set: { status: 'authorized' } },
      );
      await emitter.emitAsync(mp_friend_group_preapproval, {
        groupId,
        preapproval: {
          id: group.mpPreapprovalId,
          status: 'authorized',
          auto_recurring: { transaction_amount: 2400 },
        },
      });
      const after = await groupModel.findById(groupId).lean<any>();
      expect(after.status).toBe(FriendGroupStatus.active);
      expect(await subscriptionService.hasPaidPlan(id(0))).toBe(true);
      expect(notifications(PlanNotificationEvent.friendActive)).toHaveLength(1);
    });

    it('un débito con otro monto se cancela', async () => {
      const group = await paidGroupOfThree();
      await emitter.emitAsync(mp_friend_group_preapproval, {
        groupId: String(group._id),
        preapproval: {
          id: group.mpPreapprovalId,
          status: 'authorized',
          auto_recurring: { transaction_amount: 999 },
        },
      });
      const after = await groupModel.findById(group._id).lean<any>();
      expect(after.status).toBe(FriendGroupStatus.cancelled);
      expect(fetchMock.changeSubscriptionStatusInMercadopago_fetch).toHaveBeenCalledWith(
        expect.any(String),
        group.mpPreapprovalId,
        'cancelled',
      );
    });
  });

  describe('cobros rechazados', () => {
    async function pauseLikeTheWebhook(group: any) {
      await subscriptionModel.updateOne(
        { mpPreapprovalId: group.mpPreapprovalId },
        { $set: { status: 'paused' } },
      );
    }

    it('rechazo: pausa para todos, baja el plan y avisa; un reintento bueno lo vuelve', async () => {
      const group = await paidGroupOfThree();
      await pauseLikeTheWebhook(group);
      await emitter.emitAsync(mp_friend_group_charge_failed, { groupId: String(group._id) });

      let after = await groupModel.findById(group._id).lean<any>();
      expect(after.status).toBe(FriendGroupStatus.paymentFailed);
      const downgraded = emitSpy.mock.calls
        .filter(([name]) => name === downgrade_plan_contact)
        .map(([, userId]) => userId);
      expect(downgraded.sort()).toEqual([id(0), id(1), id(2)].sort());
      const failed = notifications(PlanNotificationEvent.friendChargeFailed);
      expect(failed).toHaveLength(1);
      expect(failed[0][1].recipients).toContainEqual({ userId: id(1), isPayer: true });

      // Un segundo rechazo no vuelve a avisar.
      await emitter.emitAsync(mp_friend_group_charge_failed, { groupId: String(group._id) });
      expect(notifications(PlanNotificationEvent.friendChargeFailed)).toHaveLength(1);

      await subscriptionModel.updateOne(
        { mpPreapprovalId: group.mpPreapprovalId },
        { $set: { status: 'authorized' } },
      );
      await emitter.emitAsync(mp_friend_group_charge_recovered, { groupId: String(group._id) });
      after = await groupModel.findById(group._id).lean<any>();
      expect(after.status).toBe(FriendGroupStatus.active);
      expect(notifications(PlanNotificationEvent.friendChargeRecovered)).toHaveLength(1);
    });

    it('si MP no logra cobrar en el plazo, el grupo se cancela al leerlo', async () => {
      const group = await paidGroupOfThree();
      await pauseLikeTheWebhook(group);
      await emitter.emitAsync(mp_friend_group_charge_failed, { groupId: String(group._id) });
      await groupModel.updateOne(
        { _id: group._id },
        { $set: { paymentFailedAt: new Date(Date.now() - 11 * 864e5) } },
      );

      const mine = await service.getMine(id(0));
      expect(mine.group).toBeNull();
      const after = await groupModel.findById(group._id).lean<any>();
      expect(after.status).toBe(FriendGroupStatus.cancelled);
      const subscription = await subscriptionModel
        .findOne({ mpPreapprovalId: group.mpPreapprovalId })
        .lean<any>();
      expect(subscription.status).toBe('cancelled');
      expect(notifications(PlanNotificationEvent.friendCancelled)).toHaveLength(1);
    });
  });

  describe('bajas', () => {
    it('si alguien se baja de un grupo pagado, se cancela para todos', async () => {
      const group = await paidGroupOfThree();
      await service.leave(id(2), String(group._id));

      expect(fetchMock.changeSubscriptionStatusInMercadopago_fetch).toHaveBeenCalledWith(
        expect.any(String),
        group.mpPreapprovalId,
        'cancelled',
      );
      const after = await groupModel.findById(group._id).lean<any>();
      expect(after.status).toBe(FriendGroupStatus.cancelled);
      expect(after.cancelReason).toBe('AmigoC Test se bajó del grupo.');
      for (const index of [0, 1, 2]) {
        expect(await subscriptionService.hasPaidPlan(id(index))).toBe(false);
      }
      // Sin downgrade (decisión K).
      expect(emitSpy.mock.calls.some(([name]) => name === downgrade_plan_contact)).toBe(false);
      const cancelled = notifications(PlanNotificationEvent.friendCancelled);
      expect(cancelled[0][1].data.reason).toBe('AmigoC Test se bajó del grupo.');

      // Ya libres: pueden armar otro grupo.
      await expect(service.create(id(0), PLAN_MP.premium)).resolves.toBeDefined();
    });

    it('si MP no cancela el débito, no se sale', async () => {
      const group = await paidGroupOfThree();
      fetchMock.changeSubscriptionStatusInMercadopago_fetch.mockRejectedValue(new Error('timeout'));
      await expect(service.leave(id(2), String(group._id))).rejects.toThrow(
        ServiceUnavailableException,
      );
      const after = await groupModel.findById(group._id).lean<any>();
      expect(after.status).toBe(FriendGroupStatus.active);
    });

    it('si un miembro borra su cuenta, se cancela el grupo', async () => {
      const group = await paidGroupOfThree();
      await emitter.emitAsync(user_deleting, { userId: id(0) });
      const after = await groupModel.findById(group._id).lean<any>();
      expect(after.status).toBe(FriendGroupStatus.cancelled);
      expect(after.cancelReason).toBe('Un miembro borró su cuenta.');
    });

    it('sólo quien armó el grupo saca miembros, y sólo mientras se arma', async () => {
      const groupId = await groupOfThree();
      await expect(service.removeMember(id(1), groupId, id(2))).rejects.toThrow();
      const updated = await service.removeMember(id(0), groupId, id(2));
      expect(updated.members).toHaveLength(2);
      await expect(service.removeMember(id(0), groupId, id(0))).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
