import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import {
  downgrade_plan_contact,
  downgrade_plan_post,
  reactivate_plan_post,
  friend_group_notification,
} from 'src/contexts/module_shared/event-emmiter/events';
import {
  friendPlanPricing,
  getFriendPlanMaxMembers,
  getFriendPlanMinMembers,
  getFriendPlanPaymentFailedDays,
  MIN_CHARGE_AMOUNT,
} from 'src/contexts/module_shared/friend-plan/friend.plan.config';
import { EXTERNAL_REFERENCE_PREFIX } from 'src/contexts/module_shared/subscriptions/external-reference';
import { SubscriptionKind } from 'src/contexts/module_shared/subscriptions/subscription.kind';
import { FetchToMpInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/out/fech.to.mp.interface';
import { mercadoPagoUserError } from 'src/contexts/module_webhook/mercadopago/application/adapter/out/mercadopago.api.error';
import { SubscriptionServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import { MercadoPagoSubscriptionPlanServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscriptionPlan.service.interface';
import { SubscriptionPlan } from 'src/contexts/module_webhook/mercadopago/domain/entity/subscriptionPlan.entity';
import {
  PlanNotificationEvent,
  PlanNotificationPayload,
} from 'src/contexts/module_user/notification/domain/entity/plan.events';
import { FriendGroupRepositoryInterface } from '../../domain/repository/friend-group.repository.interface';
import {
  FriendGroupMemberStatus,
  FriendGroupPausedPosts,
  FriendGroupRecord,
  FriendGroupStatus,
  FriendGroupUserRef,
  LIVE_FRIEND_GROUP_STATUSES,
  PAID_FRIEND_GROUP_STATUSES,
} from '../../domain/entity/friend-group.types';
import {
  FriendGroupInvitationModel,
  FriendGroupModel,
  FriendGroupPricingModel,
  FriendGroupPublicModel,
  FriendPlanOptionsResponse,
  MyFriendGroupResponse,
  PayFriendGroupResponse,
} from '../../domain/graphql_models/friend-group.model.graphql';
import { PayFriendGroupInput } from '../dto/pay-friend-group.input';
import {
  acceptedIds,
  displayName,
  generateInviteCode,
  isActivated,
  isFull,
  memberIds,
  memberOf,
  tierFor,
  tiersToShow,
} from '../functions/friend-group.functions';

const PREAPPROVAL_URL = 'https://api.mercadopago.com/preapproval/';
const PREAPPROVAL_PLAN_URL = 'https://api.mercadopago.com/preapproval_plan/';
const PLAN_UNAVAILABLE = 'Este plan no está disponible para Hacete Amigo.';
const NOT_FOUND = 'No encontramos ese grupo.';
const ALREADY_HAS_PLAN =
  'Primero cancelá tu plan actual: Hacete Amigo es para quien no tiene un plan pago.';
const ALREADY_IN_GROUP =
  'Ya estás en un grupo de Hacete Amigo. Para sumarte a otro, primero salí de ese.';
const CLOSED = 'Este grupo ya está pagado: no se suman más miembros.';

type UsersMap = Map<string, FriendGroupUserRef>;

/*
Hacete Amigo: un grupo propio del plan donde uno paga por todos un solo débito
automático (preapproval de MP SIN plan, `external_reference: friendGroup:<id>`)
con descuento según la cantidad de miembros. La suscripción es una sola
(`kind: friendGroup`) y está en `User.subscriptions` de cada miembro. Ver el
plan (Fase 5) para las decisiones.
*/
@Injectable()
export class FriendGroupService {
  constructor(
    @Inject('FriendGroupRepositoryInterface')
    private readonly repository: FriendGroupRepositoryInterface,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('MercadoPagoSubscriptionPlanServiceInterface')
    private readonly planService: MercadoPagoSubscriptionPlanServiceInterface,
    @Inject('FetchToMpInterface')
    private readonly fetchToMp: FetchToMpInterface,
    private readonly emitter: EmitterService,
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}

  /* ------------------------------------------------------------- precios */

  /** Planes que se pueden usar en Hacete Amigo, con el precio según los miembros. */
  async getOptions(): Promise<FriendPlanOptionsResponse> {
    const plans = (await this.planService.findAllSubscriptionPlans()).filter(isEligiblePlan);
    const options: FriendPlanOptionsResponse['plans'] = [];
    for (const plan of plans) {
      const planAmount = await this.monthlyAmountOf(plan.getMpPreapprovalPlanId()).catch(
        () => null,
      );
      if (!planAmount) continue;
      options.push({
        mpPreapprovalPlanId: plan.getMpPreapprovalPlanId(),
        planReason: plan.getReason(),
        planAmount,
        tiers: tiersToShow(planAmount),
      });
    }
    options.sort((a, b) => a.planAmount - b.planAmount);
    return {
      plans: options,
      minMembers: getFriendPlanMinMembers(),
      maxMembers: getFriendPlanMaxMembers(),
    };
  }

  /* ------------------------------------------------------- armar el grupo */

  async create(userId: string, mpPreapprovalPlanId: string): Promise<FriendGroupModel> {
    const plan = await this.planService.findSubscriptionPlanByMeliID(mpPreapprovalPlanId);
    if (!plan || !isEligiblePlan(plan)) throw new BadRequestException(PLAN_UNAVAILABLE);
    await this.monthlyAmountOf(mpPreapprovalPlanId);
    await this.assertCanJoin(userId);

    const now = new Date();
    const group = await this.createWithUniqueCode({
      creator: userId,
      subscriptionPlan: plan.getId(),
      mpPreapprovalPlanId,
      planReason: plan.getReason(),
      members: [
        {
          user: userId,
          status: FriendGroupMemberStatus.accepted,
          invitedAt: now,
          joinedAt: now,
        },
      ],
      status: FriendGroupStatus.forming,
    });
    return this.toModel(group, userId);
  }

  async invite(userId: string, groupId: string, inviteeId: string): Promise<FriendGroupModel> {
    const group = await this.getFormingGroupOfMember(groupId, userId);
    if (inviteeId === userId) throw new BadRequestException('Ya estás en el grupo.');
    const [invitee] = await this.repository.findUsersByIds([inviteeId]);
    if (!invitee) throw new NotFoundException('No encontramos a ese usuario.');
    if (memberOf(group, inviteeId)) {
      throw new BadRequestException('Esa persona ya está en el grupo o ya está invitada.');
    }
    if (isFull(group)) throw new BadRequestException('El grupo ya tiene el máximo de miembros.');

    const now = new Date();
    const updated = await this.repository.addMember(groupId, {
      user: inviteeId,
      status: FriendGroupMemberStatus.invited,
      invitedBy: userId,
      invitedAt: now,
      joinedAt: null,
    });
    if (!updated) throw new BadRequestException(CLOSED);

    const users = await this.usersOf(updated);
    await this.notify(PlanNotificationEvent.friendInvited, [{ userId: inviteeId }], updated, {
      actorName: displayName(users.get(userId)),
    });
    return this.toModel(updated, userId, users);
  }

  async respondInvitation(
    userId: string,
    groupId: string,
    accept: boolean,
  ): Promise<MyFriendGroupResponse> {
    const group = await this.repository.findById(groupId);
    const member = group ? memberOf(group, userId) : null;
    if (
      !group ||
      !member ||
      member.status !== FriendGroupMemberStatus.invited ||
      group.status !== FriendGroupStatus.forming
    ) {
      throw new NotFoundException('No encontramos esa invitación.');
    }

    if (accept) {
      await this.assertCanJoin(userId, groupId);
      const updated = await this.repository.setMemberStatus(
        groupId,
        userId,
        FriendGroupMemberStatus.accepted,
        new Date(),
      );
      if (!updated) throw new BadRequestException(CLOSED);
      await this.afterJoin(updated, userId);
    } else {
      const updated = await this.repository.removeMember(groupId, userId);
      if (updated) {
        const users = await this.repository.findUsersByIds([userId]);
        await this.notify(
          PlanNotificationEvent.friendRejected,
          [{ userId: String(updated.creator) }],
          updated,
          { actorName: displayName(users[0]) },
        );
      }
    }
    return this.getMine(userId);
  }

  /** Vista pública del link de invitación: datos mínimos, sin la lista de miembros. */
  async getByInviteCode(code: string, viewerId?: string | null): Promise<FriendGroupPublicModel> {
    const group = await this.repository.findByInviteCode(code);
    if (!group) throw new NotFoundException('Este link de invitación no existe o ya no sirve.');
    const member = viewerId ? memberOf(group, viewerId) : null;
    const isMember = member?.status === FriendGroupMemberStatus.accepted;
    const acceptedCount = acceptedIds(group).length;
    const open = group.status === FriendGroupStatus.forming;
    const availability = !open ? 'closed' : isFull(group) && !member ? 'full' : 'open';
    const planAmount = open
      ? await this.monthlyAmountOf(group.mpPreapprovalPlanId).catch(() => null)
      : null;
    const [creator] = await this.repository.findUsersByIds([String(group.creator)]);
    return {
      planReason: group.planReason,
      creatorName: displayName(creator),
      acceptedCount,
      availability,
      isMember,
      tierIfJoins: planAmount
        ? tierFor(planAmount, acceptedCount + (isMember ? 0 : 1))
        : null,
    };
  }

  /** Entrar por el link equivale a aceptar (también si ya estaba invitado). */
  async joinByInviteCode(userId: string, code: string): Promise<FriendGroupModel> {
    const group = await this.repository.findByInviteCode(code);
    if (!group) throw new NotFoundException('Este link de invitación no existe o ya no sirve.');
    if (group.status !== FriendGroupStatus.forming) {
      throw new BadRequestException('Este grupo ya está cerrado: no se suma nadie más.');
    }
    const groupId = String(group._id);
    const member = memberOf(group, userId);
    if (member?.status === FriendGroupMemberStatus.accepted) return this.toModel(group, userId);

    await this.assertCanJoin(userId, groupId);
    let updated: FriendGroupRecord | null;
    if (member) {
      updated = await this.repository.setMemberStatus(
        groupId,
        userId,
        FriendGroupMemberStatus.accepted,
        new Date(),
      );
    } else {
      if (isFull(group)) throw new BadRequestException('El grupo ya tiene el máximo de miembros.');
      const now = new Date();
      updated = await this.repository.addMember(groupId, {
        user: userId,
        status: FriendGroupMemberStatus.accepted,
        invitedBy: null,
        invitedAt: now,
        joinedAt: now,
      });
    }
    if (!updated) throw new BadRequestException('Este grupo ya está cerrado: no se suma nadie más.');
    await this.afterJoin(updated, userId);
    return this.toModel(updated, userId);
  }

  async regenerateInviteCode(userId: string, groupId: string): Promise<FriendGroupModel> {
    const group = await this.getFormingGroupOfMember(groupId, userId);
    if (String(group.creator) !== userId) {
      throw new ForbiddenException('Sólo quien armó el grupo puede cambiar el link.');
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const updated = await this.repository.updateIfStatus(groupId, [FriendGroupStatus.forming], {
          inviteCode: generateInviteCode(),
        });
        if (!updated) throw new BadRequestException(CLOSED);
        return this.toModel(updated, userId);
      } catch (error: any) {
        if (error?.code !== 11000) throw error;
      }
    }
    throw new BadRequestException('No pudimos generar el link. Probá de nuevo.');
  }

  async removeMember(userId: string, groupId: string, memberId: string): Promise<FriendGroupModel> {
    const group = await this.getFormingGroupOfMember(groupId, userId);
    if (String(group.creator) !== userId) {
      throw new ForbiddenException('Sólo quien armó el grupo puede sacar miembros.');
    }
    if (memberId === userId) throw new BadRequestException('Para irte, usá "Salir del grupo".');
    if (!memberOf(group, memberId)) throw new NotFoundException('Esa persona no está en el grupo.');
    const updated = await this.repository.removeMember(groupId, memberId);
    if (!updated) throw new BadRequestException(CLOSED);
    return this.toModel(updated, userId);
  }

  /*
  Salir del grupo. Mientras se arma, sólo sale esa persona (si sale quien lo armó,
  el grupo pasa al que se sumó primero; si no queda nadie, se cierra). Pagado, el
  grupo queda fijo: si alguien se baja, se cancela el débito y el plan para todos
  (sin downgrade, decisión K).
  */
  async leave(userId: string, groupId: string): Promise<boolean> {
    const group = await this.repository.findById(groupId);
    const member = group ? memberOf(group, userId) : null;
    if (!group || !member || group.status === FriendGroupStatus.cancelled) {
      throw new NotFoundException(NOT_FOUND);
    }

    if (group.status === FriendGroupStatus.forming) {
      const isCreator = String(group.creator) === userId;
      if (member.status === FriendGroupMemberStatus.invited || !isCreator) {
        await this.repository.removeMember(groupId, userId);
        return true;
      }
      const others = group.members
        .filter(
          (other) =>
            other.status === FriendGroupMemberStatus.accepted && String(other.user) !== userId,
        )
        .sort(
          (a, b) => new Date(a.joinedAt ?? 0).getTime() - new Date(b.joinedAt ?? 0).getTime(),
        );
      if (others.length === 0) {
        await this.repository.updateIfStatus(groupId, [FriendGroupStatus.forming], {
          status: FriendGroupStatus.cancelled,
          cancelReason: 'Quien armó el grupo lo cerró.',
          cancelledAt: new Date(),
        });
        return true;
      }
      await this.repository.removeMember(groupId, userId);
      await this.repository.updateIfStatus(groupId, [FriendGroupStatus.forming], {
        creator: others[0].user,
      });
      return true;
    }

    const users = await this.repository.findUsersByIds([userId]);
    await this.cancelGroup(group, `${displayName(users[0]) ?? 'Un miembro'} se bajó del grupo.`, {
      cancelInMp: true,
      throwIfMpFails: true,
    });
    return true;
  }

  /* ------------------------------------------------------------ consultas */

  async getMine(userId: string): Promise<MyFriendGroupResponse> {
    let group = await this.repository.findLiveGroupOfMember(userId);
    if (group) group = await this.expireIfStale(group);
    const invitations = await this.repository.findInvitationsOf(userId);

    const amounts = new Map<string, number | null>();
    const amountOf = async (planId: string) => {
      if (!amounts.has(planId)) {
        amounts.set(planId, await this.monthlyAmountOf(planId).catch(() => null));
      }
      return amounts.get(planId) ?? null;
    };

    const inviterIds = invitations
      .map((invitation) => memberOf(invitation, userId)?.invitedBy)
      .filter(Boolean)
      .map(String);
    const inviters = new Map(
      (await this.repository.findUsersByIds(inviterIds)).map((user) => [String(user._id), user]),
    );
    const invitationModels: FriendGroupInvitationModel[] = [];
    for (const invitation of invitations) {
      const acceptedCount = acceptedIds(invitation).length;
      const planAmount = await amountOf(invitation.mpPreapprovalPlanId);
      const invitedBy = memberOf(invitation, userId)?.invitedBy;
      invitationModels.push({
        groupId: String(invitation._id),
        planReason: invitation.planReason,
        invitedByName: invitedBy ? displayName(inviters.get(String(invitedBy))) : null,
        acceptedCount,
        tierIfJoins: planAmount ? tierFor(planAmount, acceptedCount + 1) : null,
      });
    }

    const liveGroup = group && group.status !== FriendGroupStatus.cancelled ? group : null;
    return {
      group: liveGroup
        ? await this.toModel(liveGroup, userId, undefined, await amountOf(liveGroup.mpPreapprovalPlanId))
        : null,
      invitations: invitationModels,
    };
  }

  /** Valida todo lo necesario para pagar y devuelve el monto. */
  async getCheckout(userId: string, groupId: string): Promise<FriendGroupPricingModel> {
    const group = await this.repository.findById(groupId);
    if (!group) throw new NotFoundException(NOT_FOUND);
    const { pricing } = await this.validateReadyToPay(group, userId);
    return pricing;
  }

  /* -------------------------------------------------------------- pagar */

  async pay(userId: string, input: PayFriendGroupInput): Promise<PayFriendGroupResponse> {
    const group = await this.repository.findById(input.groupId);
    if (!group) throw new NotFoundException(NOT_FOUND);
    const { pricing, accepted } = await this.validateReadyToPay(group, userId);
    const groupId = String(group._id);

    // Se toma el grupo antes de cobrar: dos pagos a la vez no generan dos débitos.
    const locked = await this.repository.updateIfStatus(groupId, [FriendGroupStatus.forming], {
      status: FriendGroupStatus.paying,
      payer: userId,
      ...pricing,
      // Las invitaciones sin aceptar quedan afuera: el grupo pagado queda fijo.
      members: group.members.filter((member) => member.status === FriendGroupMemberStatus.accepted),
    });
    if (!locked) throw new BadRequestException('Otro miembro ya está pagando el grupo.');

    let created: any;
    try {
      created = await this.fetchToMp.createPreapproval({
        reason: `Hacete Amigo: ${group.planReason} (${pricing.memberCount} miembros)`,
        external_reference: `${EXTERNAL_REFERENCE_PREFIX.FRIEND_GROUP}${groupId}`,
        payer_email: input.payerEmail,
        card_token_id: input.cardTokenId,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: pricing.totalAmount,
          currency_id: 'ARS',
        },
        back_url: `${this.clientUrl()}/hacete-amigo`,
        status: 'authorized',
      });
    } catch (error: any) {
      await this.repository.update(groupId, {
        status: FriendGroupStatus.forming,
        payer: null,
        members: group.members,
        memberCount: null,
        discountPercent: null,
        planAmount: null,
        pricePerMember: null,
        totalAmount: null,
      });
      throw mercadoPagoUserError(error);
    }

    const mpPreapprovalId: string | undefined = created?.id;
    if (!mpPreapprovalId) {
      this.logger.error(
        `MercadoPago aceptó el débito del grupo ${groupId} pero no devolvió el id: ${JSON.stringify(created)}`,
      );
      throw new InternalServerErrorException(
        'MercadoPago no confirmó el débito. Antes de intentar de nuevo, escribinos a soporte para revisar si se hizo el cobro.',
      );
    }

    const status = String(created.status ?? 'pending').toLowerCase();
    const isActive = status === 'authorized';
    const subscriptionId = await this.registerSubscription(
      { ...locked, payer: userId },
      created,
      accepted,
    );
    const updated =
      (await this.repository.update(groupId, {
        mpPreapprovalId,
        subscription: subscriptionId,
        status: isActive ? FriendGroupStatus.active : FriendGroupStatus.paying,
        activatedAt: isActive ? new Date() : null,
      })) ?? locked;

    if (isActive) await this.notifyAll(PlanNotificationEvent.friendActive, updated);
    return {
      status: updated.status,
      message: isActive
        ? '¡Listo! El plan compartido quedó activo para todo el grupo.'
        : 'MercadoPago está procesando el débito. Cuando se apruebe, el plan se activa para todos.',
    };
  }

  /* ---------------------------------------------------- avisos de MP */

  /*
  Webhook del preapproval del grupo (`friendGroup:<id>`). Si el alta se perdió,
  la registra; si el monto no es el del grupo, cancela el débito; `authorized`
  activa un grupo que estaba pagando y `cancelled` cancela el grupo.
  */
  async handlePreapproval(groupId: string, preapproval: any): Promise<void> {
    let group = await this.repository.findById(groupId);
    if (!group) {
      this.logger.error(`Llegó el preapproval ${preapproval?.id} del grupo ${groupId}, que no existe.`);
      return;
    }
    const preapprovalId = String(preapproval?.id ?? '');
    const status = String(preapproval?.status ?? '').toLowerCase();

    if (group.mpPreapprovalId && preapprovalId && group.mpPreapprovalId !== preapprovalId) {
      this.logger.warn(
        `El preapproval ${preapprovalId} no es el del grupo ${groupId} (${group.mpPreapprovalId}): se ignora.`,
      );
      return;
    }
    if (group.status === FriendGroupStatus.cancelled) {
      if (status !== 'cancelled' && preapprovalId) {
        this.logger.warn(`Débito ${preapprovalId} vivo de un grupo cancelado (${groupId}): se cancela.`);
        await this.cancelInMp(preapprovalId).catch(() => undefined);
      }
      return;
    }
    if (!group.mpPreapprovalId && preapprovalId) {
      group = (await this.repository.update(groupId, { mpPreapprovalId: preapprovalId })) ?? group;
    }

    const amount = Number(preapproval?.auto_recurring?.transaction_amount);
    if (group.totalAmount && Number.isFinite(amount) && Math.round(amount) !== Math.round(group.totalAmount)) {
      this.logger.error(
        `El débito ${preapprovalId} del grupo ${groupId} es de ${amount} y el grupo cobra ${group.totalAmount}: se cancela.`,
      );
      await this.cancelGroup(group, 'El monto del débito no coincidía con el precio del grupo.', {
        cancelInMp: true,
      });
      return;
    }

    if (!group.subscription && status !== 'cancelled') {
      const subscriptionId = await this.registerSubscription(group, preapproval, acceptedIds(group));
      if (subscriptionId) {
        group = (await this.repository.update(groupId, { subscription: subscriptionId })) ?? group;
      }
    }

    if (status === 'authorized' && group.status === FriendGroupStatus.paying) {
      const updated = await this.repository.updateIfStatus(groupId, [FriendGroupStatus.paying], {
        status: FriendGroupStatus.active,
        activatedAt: new Date(),
      });
      if (updated) await this.notifyAll(PlanNotificationEvent.friendActive, updated);
    } else if (status === 'cancelled') {
      await this.cancelGroup(group, 'Se canceló el débito automático en MercadoPago.', {
        cancelInMp: false,
      });
    }
  }

  /*
  Cobro rechazado (decisión G): el webhook ya pausó la suscripción. El grupo pasa
  a paymentFailed, se baja el plan a cada miembro que no tenga otro plan pago y
  se avisa a todos (a quien paga, que revise la tarjeta). Un rechazo más no
  vuelve a avisar; pasado el plazo, se cancela.
  */
  async handleChargeFailed(groupId: string): Promise<void> {
    const group = await this.repository.findById(groupId);
    if (!group || !PAID_FRIEND_GROUP_STATUSES.includes(group.status)) return;
    if (group.status === FriendGroupStatus.paymentFailed) {
      await this.expireIfStale(group);
      return;
    }
    const updated = await this.repository.updateIfStatus(
      groupId,
      [FriendGroupStatus.active, FriendGroupStatus.paying],
      { status: FriendGroupStatus.paymentFailed, paymentFailedAt: new Date() },
    );
    if (!updated) return;

    // Se guarda qué anuncios apagó el downgrade para devolverlos si el cobro se recupera.
    const pausedPosts: FriendGroupPausedPosts[] = [];
    for (const memberId of acceptedIds(updated)) {
      if (await this.subscriptionService.hasPaidPlan(memberId).catch(() => true)) continue;
      const posts = await this.downgrade(memberId);
      if (posts.length > 0) pausedPosts.push({ user: memberId, posts });
    }
    if (pausedPosts.length > 0) await this.repository.update(groupId, { pausedPosts });
    await this.notifyAll(PlanNotificationEvent.friendChargeFailed, updated);
  }

  /*
  Un reintento salió bien: el webhook ya reactivó la suscripción. Vuelven a
  activarse los anuncios que apagó el rechazo (los que el miembro no tocó y
  hasta el límite de su plan).
  */
  async handleChargeRecovered(groupId: string): Promise<void> {
    const group = await this.repository.findById(groupId);
    if (!group) return;
    // El cambio de estado es condicional: si llegan dos avisos, sólo uno reactiva.
    const updated = await this.repository.updateIfStatus(
      groupId,
      [FriendGroupStatus.paymentFailed],
      { status: FriendGroupStatus.active, paymentFailedAt: null, pausedPosts: [] },
    );
    if (!updated) return;
    for (const entry of group.pausedPosts ?? []) {
      try {
        await this.emitter.emitAsync(reactivate_plan_post, {
          userId: String(entry.user),
          postIds: (entry.posts ?? []).map(String),
        });
      } catch (error: any) {
        this.logger.error(`No se pudieron reactivar los anuncios de ${entry.user}: ${error?.message}`);
      }
    }
    await this.notifyAll(PlanNotificationEvent.friendChargeRecovered, updated);
  }

  /** Borrado de cuenta de un miembro: si el grupo está pagado, se cancela para todos. */
  async handleMemberDeleted(userId: string): Promise<void> {
    const group = await this.repository.findLiveGroupOfMember(userId);
    if (!group) return;
    if (group.status === FriendGroupStatus.forming) {
      await this.leave(userId, String(group._id));
      return;
    }
    await this.cancelGroup(group, 'Un miembro borró su cuenta.', { cancelInMp: true });
  }

  /* -------------------------------------------------------------- helpers */

  private async validateReadyToPay(group: FriendGroupRecord, userId: string) {
    const member = memberOf(group, userId);
    if (!member || member.status !== FriendGroupMemberStatus.accepted) {
      throw new NotFoundException(NOT_FOUND);
    }
    if (group.status !== FriendGroupStatus.forming) {
      throw new BadRequestException('Este grupo ya está pagado.');
    }
    const accepted = acceptedIds(group);
    const users = await this.usersOf(group);
    const blocked = this.payBlockedReason(group, users);
    if (blocked) throw new BadRequestException(blocked);

    for (const memberId of accepted) {
      if (await this.subscriptionService.hasPaidPlan(memberId)) {
        const name = displayName(users.get(memberId)) ?? 'Un miembro';
        throw new BadRequestException(
          memberId === userId
            ? 'Tenés un plan pago: cancelalo antes de pagar el grupo.'
            : `${name} tiene un plan pago: tiene que cancelarlo antes de pagar el grupo.`,
        );
      }
    }

    const planAmount = await this.monthlyAmountOf(group.mpPreapprovalPlanId);
    const prices = friendPlanPricing(planAmount, accepted.length);
    if (prices.totalAmount < MIN_CHARGE_AMOUNT) {
      throw new BadRequestException('El monto del grupo es demasiado bajo para cobrarlo.');
    }
    const pricing: FriendGroupPricingModel = {
      memberCount: accepted.length,
      planAmount,
      ...prices,
    };
    return { pricing, accepted };
  }

  private payBlockedReason(group: FriendGroupRecord, users: UsersMap): string | null {
    if (group.status !== FriendGroupStatus.forming) return null;
    const accepted = acceptedIds(group);
    const min = getFriendPlanMinMembers();
    if (accepted.length < min) {
      const missing = min - accepted.length;
      const waiting = group.members.filter(
        (member) => member.status === FriendGroupMemberStatus.invited,
      ).length;
      const people = (count: number) => `${count} ${count === 1 ? 'persona más' : 'personas más'}`;
      // Con invitaciones pendientes, lo que falta es que acepten (no invitar más).
      if (waiting >= missing) {
        return `Para pagar tienen que ser al menos ${min} en el grupo: falta que tus invitados acepten la invitación.`;
      }
      if (waiting > 0) {
        return `Para pagar tienen que ser al menos ${min} en el grupo: falta que tus invitados acepten e invitar a ${people(missing - waiting)}.`;
      }
      return `Para pagar tienen que ser al menos ${min}: invitá a ${people(missing)}.`;
    }
    const pending = accepted.filter((id) => !isActivated(users.get(id)));
    if (pending.length > 0) {
      const names = pending.map((id) => displayName(users.get(id)) ?? 'un miembro');
      return pending.length === 1
        ? `Falta que ${names[0]} publique un anuncio o una producción.`
        : `Falta que ${names.join(', ')} publiquen un anuncio o una producción.`;
    }
    return null;
  }

  private async assertCanJoin(userId: string, groupId?: string): Promise<void> {
    if (await this.subscriptionService.hasPaidPlan(userId)) {
      throw new BadRequestException(ALREADY_HAS_PLAN);
    }
    const live = await this.repository.findLiveGroupOfMember(userId);
    if (live && String(live._id) !== groupId) throw new BadRequestException(ALREADY_IN_GROUP);
  }

  private async getFormingGroupOfMember(groupId: string, userId: string): Promise<FriendGroupRecord> {
    const group = await this.repository.findById(groupId);
    const member = group ? memberOf(group, userId) : null;
    if (!group || member?.status !== FriendGroupMemberStatus.accepted) {
      throw new NotFoundException(NOT_FOUND);
    }
    if (group.status !== FriendGroupStatus.forming) throw new BadRequestException(CLOSED);
    return group;
  }

  private async afterJoin(group: FriendGroupRecord, userId: string): Promise<void> {
    const users = await this.usersOf(group);
    if (String(group.creator) !== userId) {
      await this.notify(
        PlanNotificationEvent.friendAccepted,
        [{ userId: String(group.creator) }],
        group,
        { actorName: displayName(users.get(userId)) },
      );
    }
    if (acceptedIds(group).length >= getFriendPlanMinMembers() && !this.payBlockedReason(group, users)) {
      await this.notifyAll(PlanNotificationEvent.friendReadyToPay, group);
    }
  }

  /** Precio mensual del plan individual en MP. Sólo planes mensuales activos. */
  private async monthlyAmountOf(mpPreapprovalPlanId: string): Promise<number> {
    let mpPlan: any;
    try {
      mpPlan = await this.fetchToMp.getDataFromMp_fetch(PREAPPROVAL_PLAN_URL + mpPreapprovalPlanId);
    } catch {
      throw new BadRequestException(PLAN_UNAVAILABLE);
    }
    const recurring = mpPlan?.auto_recurring ?? {};
    const amount = Number(recurring.transaction_amount);
    const isMonthly =
      (recurring.frequency === undefined || Number(recurring.frequency) === 1) &&
      (recurring.frequency_type === undefined || recurring.frequency_type === 'months');
    if (mpPlan?.status !== 'active' || !isMonthly || !Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(PLAN_UNAVAILABLE);
    }
    return amount;
  }

  private async registerSubscription(
    group: FriendGroupRecord,
    preapproval: any,
    holders: string[],
  ): Promise<string | null> {
    const status = String(preapproval?.status ?? 'pending').toLowerCase();
    try {
      return await this.subscriptionService.createInternalSubscription({
        mpPreapprovalId: String(preapproval.id),
        subscriptionPlanId: String(group.subscriptionPlan),
        holders,
        payerUser: String(group.payer),
        kind: SubscriptionKind.FRIEND_GROUP,
        externalReference: `${EXTERNAL_REFERENCE_PREFIX.FRIEND_GROUP}${group._id}`,
        status,
        nextPaymentDate: preapproval?.next_payment_date ?? undefined,
        payerId: preapproval?.payer_id ? String(preapproval.payer_id) : undefined,
      });
    } catch (error: any) {
      // El webhook del preapproval lo vuelve a intentar.
      this.logger.error(
        `No se pudo registrar la suscripción del grupo ${group._id} (${preapproval?.id}): ${error?.message}`,
      );
      return null;
    }
  }

  /*
  Cancela el grupo: el débito en MP (si se pide), la suscripción y el grupo, y
  avisa a todos. Si MP no responde, el grupo no se toca (o se avisa al usuario).
  */
  private async cancelGroup(
    group: FriendGroupRecord,
    reason: string,
    options: { cancelInMp: boolean; throwIfMpFails?: boolean },
  ): Promise<FriendGroupRecord> {
    if (options.cancelInMp && group.mpPreapprovalId) {
      try {
        await this.cancelInMp(group.mpPreapprovalId);
      } catch (error: any) {
        this.logger.error(
          `No se pudo cancelar en MP el débito ${group.mpPreapprovalId} del grupo ${group._id}: ${error?.message ?? error}`,
        );
        if (options.throwIfMpFails) {
          throw new ServiceUnavailableException(
            'No pudimos cancelar el débito en MercadoPago. Probá de nuevo en unos minutos.',
          );
        }
        return group;
      }
    }
    if (group.mpPreapprovalId) {
      await this.subscriptionService
        .cancelSubscriptionInDb(group.mpPreapprovalId)
        .catch((error: any) =>
          this.logger.error(`No se pudo cancelar la suscripción del grupo ${group._id}: ${error?.message}`),
        );
    }
    const updated = await this.repository.updateIfStatus(String(group._id), LIVE_FRIEND_GROUP_STATUSES, {
      status: FriendGroupStatus.cancelled,
      cancelReason: reason,
      cancelledAt: new Date(),
    });
    if (!updated) return group;
    await this.notifyAll(PlanNotificationEvent.friendCancelled, updated, { reason });
    return updated;
  }

  private async cancelInMp(preapprovalId: string): Promise<void> {
    await this.fetchToMp.changeSubscriptionStatusInMercadopago_fetch(
      PREAPPROVAL_URL,
      preapprovalId,
      'cancelled',
    );
  }

  /** MP no logró cobrar en el plazo: se cancela al leer (no hay tareas programadas). */
  private async expireIfStale(group: FriendGroupRecord): Promise<FriendGroupRecord> {
    if (group.status !== FriendGroupStatus.paymentFailed || !group.paymentFailedAt) return group;
    const limit =
      new Date(group.paymentFailedAt).getTime() + getFriendPlanPaymentFailedDays() * 24 * 60 * 60 * 1000;
    if (Date.now() < limit) return group;
    return this.cancelGroup(group, 'MercadoPago no pudo cobrar el plan del grupo.', {
      cancelInMp: true,
    });
  }

  /*
  Igual que el webhook con un plan individual: contactos y después anuncios.
  Devuelve los anuncios que quedaron apagados (activos antes, inactivos después).
  */
  private async downgrade(userId: string): Promise<string[]> {
    try {
      const activeBefore = await this.repository.findActivePostIds(userId);
      const contacts = await this.emitter.emitAsync(downgrade_plan_contact, userId);
      if (contacts && contacts[0] === true) {
        await this.emitter.emitAsync(downgrade_plan_post, userId);
      }
      return this.repository.findInactivePostIds(activeBefore);
    } catch (error: any) {
      this.logger.error(`No se pudo bajar el plan de ${userId} (grupo con cobro rechazado): ${error?.message}`);
      return [];
    }
  }

  private async createWithUniqueCode(fields: Partial<FriendGroupRecord>): Promise<FriendGroupRecord> {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.repository.create({ ...fields, inviteCode: generateInviteCode() });
      } catch (error: any) {
        if (error?.code !== 11000) throw error;
      }
    }
    throw new BadRequestException('No pudimos armar el grupo. Probá de nuevo.');
  }

  private async usersOf(group: FriendGroupRecord): Promise<UsersMap> {
    const ids = new Set(memberIds(group));
    ids.add(String(group.creator));
    if (group.payer) ids.add(String(group.payer));
    const users = await this.repository.findUsersByIds(Array.from(ids));
    return new Map(users.map((user) => [String(user._id), user]));
  }

  private async toModel(
    group: FriendGroupRecord,
    viewerId: string,
    users?: UsersMap,
    planAmount?: number | null,
  ): Promise<FriendGroupModel> {
    const usersMap = users ?? (await this.usersOf(group));
    const forming = group.status === FriendGroupStatus.forming;
    const viewer = memberOf(group, viewerId);
    const viewerAccepted = viewer?.status === FriendGroupMemberStatus.accepted;
    const accepted = acceptedIds(group);
    const amount =
      planAmount !== undefined
        ? planAmount
        : forming
          ? await this.monthlyAmountOf(group.mpPreapprovalPlanId).catch(() => null)
          : null;

    let pricing: FriendGroupPricingModel | null = null;
    if (group.totalAmount && group.memberCount && group.planAmount) {
      pricing = {
        memberCount: group.memberCount,
        discountPercent: group.discountPercent ?? 0,
        planAmount: group.planAmount,
        pricePerMember: group.pricePerMember ?? 0,
        totalAmount: group.totalAmount,
      };
    } else if (amount) {
      pricing = { memberCount: accepted.length, planAmount: amount, ...friendPlanPricing(amount, accepted.length) };
    }

    const blocked = forming ? this.payBlockedReason(group, usersMap) : null;
    const isPayer = !!group.payer && String(group.payer) === viewerId;
    return {
      _id: String(group._id),
      status: group.status,
      planReason: group.planReason,
      mpPreapprovalPlanId: group.mpPreapprovalPlanId,
      isCreator: String(group.creator) === viewerId,
      isPayer,
      inviteCode: viewerAccepted && forming ? group.inviteCode : null,
      members: group.members.map((member) => {
        const id = String(member.user);
        const user = usersMap.get(id);
        return {
          userId: id,
          name: displayName(user),
          username: user?.username ?? null,
          profilePhotoUrl: user?.profilePhotoUrl ?? null,
          status: member.status,
          isActivated: isActivated(user),
          isCreator: String(group.creator) === id,
          isPayer: !!group.payer && String(group.payer) === id,
        };
      }),
      pricing,
      nextTier: forming && amount && !isFull(group) ? tierFor(amount, accepted.length + 1) : null,
      canPay: forming && viewerAccepted && !blocked && !!amount,
      payBlockedReason: blocked,
      payerName: group.payer ? displayName(usersMap.get(String(group.payer))) : null,
      mpPreapprovalId: isPayer ? group.mpPreapprovalId : null,
      cancelReason: group.cancelReason,
      activatedAt: group.activatedAt ? new Date(group.activatedAt).toISOString() : null,
      paymentFailedAt: group.paymentFailedAt ? new Date(group.paymentFailedAt).toISOString() : null,
    };
  }

  private clientUrl(): string {
    const url =
      this.configService.get<string>('CLIENT_URL') ||
      this.configService.get<string>('PUBLICITE_CORS_VERCEL_URI') ||
      'https://www.soonpublicite.com';
    return url.replace(/\/$/, '');
  }

  private async notifyAll(
    event: PlanNotificationEvent,
    group: FriendGroupRecord,
    extra: { reason?: string | null } = {},
  ): Promise<void> {
    const recipients = acceptedIds(group).map((userId) => ({
      userId,
      isPayer: !!group.payer && String(group.payer) === userId,
    }));
    await this.notify(event, recipients, group, extra);
  }

  /* Un aviso que falla nunca rompe el grupo ni el cobro. */
  private async notify(
    event: PlanNotificationEvent,
    recipients: PlanNotificationPayload['recipients'],
    group: FriendGroupRecord,
    extra: { actorName?: string | null; reason?: string | null } = {},
  ): Promise<void> {
    if (recipients.length === 0) return;
    const payload: PlanNotificationPayload = {
      event,
      recipients,
      data: {
        kind: 'friendGroup',
        entityId: String(group._id),
        actorName: extra.actorName ?? null,
        planReason: group.planReason,
        months: null,
        reason: extra.reason ?? null,
      },
    };
    try {
      await this.emitter.emitAsync(friend_group_notification, payload);
    } catch (error: any) {
      this.logger.error(`No se pudo avisar ${event} del grupo ${group._id}: ${error?.message}`);
    }
  }
}

/** Planes pagos mensuales (no packs, no gratuito, no anuales). */
function isEligiblePlan(plan: SubscriptionPlan): boolean {
  return (
    plan.getIsActive() && !plan.getIsFree() && !plan.getIsPack() && plan.getIntervalTime() === 30
  );
}
