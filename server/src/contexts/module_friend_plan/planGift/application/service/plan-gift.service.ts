import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import { plan_gift_notification } from 'src/contexts/module_shared/event-emmiter/events';
import {
  addMonths,
  getGiftMonthOptions,
  MIN_CHARGE_AMOUNT,
} from 'src/contexts/module_shared/friend-plan/friend.plan.config';
import { EXTERNAL_REFERENCE_PREFIX } from 'src/contexts/module_shared/subscriptions/external-reference';
import { SubscriptionKind } from 'src/contexts/module_shared/subscriptions/subscription.kind';
import { FetchToMpInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/out/fech.to.mp.interface';
import {
  mercadoPagoUserError,
  rejectedPaymentMessage,
} from 'src/contexts/module_webhook/mercadopago/application/adapter/out/mercadopago.api.error';
import { SubscriptionServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import { MercadoPagoSubscriptionPlanServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscriptionPlan.service.interface';
import { MpServiceInvoiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-invoice.service.interface';
import {
  PlanNotificationEvent,
  PlanNotificationPayload,
} from 'src/contexts/module_user/notification/domain/entity/plan.events';
import { PlanGiftRepositoryInterface } from '../../domain/repository/plan-gift.repository.interface';
import {
  PlanGiftRecord,
  PlanGiftStatus,
  PlanGiftUserRef,
} from '../../domain/entity/plan-gift.types';
import {
  AdminPlanGiftModel,
  AdminPlanGiftsResponse,
  BuyPlanGiftResponse,
  MyPlanGiftsResponse,
  PlanGiftModel,
  PlanGiftPublicModel,
  PlanGiftQuote,
} from '../../domain/graphql_models/plan-gift.model.graphql';
import { BuyPlanGiftInput } from '../dto/buy-plan-gift.input';
import {
  displayName,
  generateGiftCode,
  giftLink,
  maskEmail,
  normalizeEmail,
} from '../functions/plan-gift.functions';

const PREAPPROVAL_PLAN_URL = 'https://api.mercadopago.com/preapproval_plan/';
const ALREADY_HAS_PLAN = 'Este usuario ya tiene un plan. No se le puede regalar otro mientras lo tenga.';

const APPROVED = new Set(['approved']);
const REJECTED = new Set(['rejected', 'cancelled']);
const REFUNDED = new Set(['refunded', 'charged_back']);

/*
Regalo de planes (lo que pidió el cliente): quien regala elige un plan pago
mensual y cuántos meses (1, 2, 3 o 5), y paga UNA sola vez el precio mensual × los
meses, con el mismo Brick de tarjeta (pago único, POST /v1/payments). El regalo
queda asignado a una cuenta o, para quien no tiene cuenta, a un email: cuando se
registra con ese email, el regalo aparece en su cuenta. El destinatario lo activa
y desde ahí cuentan los meses (suscripción interna `gift` con vencimiento, sin
preapproval). Nunca se regala a quien ya tiene un plan pago.
*/
@Injectable()
export class PlanGiftService {
  constructor(
    @Inject('PlanGiftRepositoryInterface')
    private readonly repository: PlanGiftRepositoryInterface,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('MercadoPagoSubscriptionPlanServiceInterface')
    private readonly planService: MercadoPagoSubscriptionPlanServiceInterface,
    @Inject('FetchToMpInterface')
    private readonly fetchToMp: FetchToMpInterface,
    @Inject('MpServiceInvoiceInterface')
    private readonly invoiceService: MpServiceInvoiceInterface,
    private readonly emitter: EmitterService,
    private readonly logger: MyLoggerService,
  ) {}

  /* ---------------------------------------------------------------- compra */

  async getQuote(mpPreapprovalPlanId: string, months: number): Promise<PlanGiftQuote> {
    const { plan, monthlyAmount } = await this.getGiftablePlan(mpPreapprovalPlanId);
    this.assertMonths(months);
    return {
      amount: Math.round(monthlyAmount * months),
      planReason: plan.getReason(),
      months,
      monthOptions: getGiftMonthOptions(),
    };
  }

  async buy(giverId: string, input: BuyPlanGiftInput): Promise<BuyPlanGiftResponse> {
    this.assertMonths(input.months);
    const { plan, monthlyAmount } = await this.getGiftablePlan(input.mpPreapprovalPlanId);
    const amount = Math.round(monthlyAmount * input.months);
    if (amount < MIN_CHARGE_AMOUNT) {
      throw new BadRequestException('El monto del regalo es demasiado bajo para cobrarlo.');
    }

    const recipient = await this.resolveRecipient(giverId, input);

    const gift = await this.createWithUniqueCode({
      giver: giverId,
      recipient: recipient.userId,
      recipientEmail: recipient.email,
      subscriptionPlan: plan.getId(),
      mpPreapprovalPlanId: input.mpPreapprovalPlanId,
      planReason: plan.getReason(),
      months: input.months,
      amount,
      status: PlanGiftStatus.pendingPayment,
    });

    const identification =
      input.identificationType && input.identificationNumber
        ? { type: input.identificationType, number: input.identificationNumber }
        : undefined;
    let payment: any;
    try {
      payment = await this.fetchToMp.createPayment(
        {
          transaction_amount: amount,
          token: input.cardTokenId,
          description: `Regalo: ${input.months} ${input.months === 1 ? 'mes' : 'meses'} de ${plan.getReason()}`,
          installments: 1,
          payment_method_id: input.paymentMethodId,
          ...(input.issuerId ? { issuer_id: input.issuerId } : {}),
          payer: {
            email: input.payerEmail,
            ...(identification ? { identification } : {}),
          },
          external_reference: `${EXTERNAL_REFERENCE_PREFIX.GIFT}${gift._id}`,
        },
        String(gift._id),
      );
    } catch (error: any) {
      await this.repository.update(String(gift._id), {
        status: PlanGiftStatus.rejected,
        paymentStatusDetail: error?.message ?? 'error',
      });
      throw mercadoPagoUserError(error);
    }

    const updated = await this.applyPayment(gift, payment);
    if (updated.status === PlanGiftStatus.rejected) {
      throw new BadRequestException(rejectedPaymentMessage(payment?.status_detail));
    }

    const recipientHasAccount = !!updated.recipient;
    const message =
      updated.status === PlanGiftStatus.pendingPayment
        ? 'MercadoPago está procesando el pago. Cuando se apruebe, el regalo queda listo.'
        : recipientHasAccount
          ? 'Listo: le avisamos por notificación. Lo activa cuando quiera.'
          : 'Listo: mandale el link. Cuando se registre con ese email, el regalo aparece en su cuenta.';
    return {
      giftId: String(updated._id),
      code: updated.code,
      status: updated.status,
      recipientHasAccount,
      link: giftLink(updated.code),
      message,
    };
  }

  /* ---------------------------------------------------------------- pagos */

  /** Webhook `payment` con `gift:<id>`. Idempotente: un reintento no avisa dos veces. */
  async handleMpPayment(giftId: string, payment: any): Promise<void> {
    const gift = await this.repository.findById(giftId);
    if (!gift) {
      this.logger.error(`Llegó el pago ${payment?.id} del regalo ${giftId}, que no existe.`);
      return;
    }
    await this.applyPayment(gift, payment);
  }

  /*
  Aplica el estado de un pago de MP al regalo. Aprobado -> pagado (y aviso al
  destinatario si tiene cuenta); rechazado -> rechazado; devuelto -> devuelto, y si
  ya estaba activo se cancela el plan. Siempre deja la factura a nombre de quien
  regala (upsert por id de pago).
  */
  private async applyPayment(gift: PlanGiftRecord, payment: any): Promise<PlanGiftRecord> {
    const status = String(payment?.status ?? '').toLowerCase();
    const fields: Partial<PlanGiftRecord> = {
      mpPaymentId: payment?.id ? String(payment.id) : gift.mpPaymentId,
      paymentStatus: status || gift.paymentStatus,
      paymentStatusDetail: payment?.status_detail ?? gift.paymentStatusDetail,
    };
    let becamePaid = false;

    if (APPROVED.has(status)) {
      if (
        gift.status === PlanGiftStatus.pendingPayment ||
        gift.status === PlanGiftStatus.rejected
      ) {
        fields.status = PlanGiftStatus.paid;
        becamePaid = true;
      }
    } else if (REJECTED.has(status)) {
      if (gift.status === PlanGiftStatus.pendingPayment) fields.status = PlanGiftStatus.rejected;
    } else if (REFUNDED.has(status)) {
      if (gift.status === PlanGiftStatus.active) {
        await this.subscriptionService
          .cancelSubscriptionInDb(this.subscriptionIdFor(gift))
          .catch((error: any) =>
            this.logger.error(`No se pudo cancelar el plan del regalo devuelto ${gift._id}: ${error?.message}`),
          );
      }
      fields.status = PlanGiftStatus.refunded;
    }

    const updated = (await this.repository.update(String(gift._id), fields)) ?? { ...gift, ...fields };

    try {
      await this.invoiceService.saveOneTimePaymentInvoice(
        payment,
        String(gift.giver),
        `Regalo: ${gift.months} ${gift.months === 1 ? 'mes' : 'meses'} de ${gift.planReason}`,
      );
    } catch (error: any) {
      this.logger.error(`No se pudo guardar la factura del regalo ${gift._id}: ${error?.message}`);
    }

    if (becamePaid && updated.recipient) {
      await this.notifyReceived(updated as PlanGiftRecord);
    }
    return updated as PlanGiftRecord;
  }

  /* ---------------------------------------------------------- asignación */

  /** Alta de un usuario: le asigna los regalos hechos a su email. */
  async assignByEmail(userId: string, email: string): Promise<number> {
    if (!email) return 0;
    const gifts = await this.repository.findUnassignedByEmail(normalizeEmail(email), [
      PlanGiftStatus.paid,
      PlanGiftStatus.pendingPayment,
    ]);
    for (const gift of gifts) {
      const updated = await this.repository.update(String(gift._id), { recipient: userId });
      if (updated?.status === PlanGiftStatus.paid) await this.notifyReceived(updated);
    }
    return gifts.length;
  }

  /** Vista pública del link /canjear/<código>: datos mínimos. */
  async getByCode(code: string, viewerId?: string | null): Promise<PlanGiftPublicModel> {
    const gift = await this.repository.findByCode(code);
    if (!gift || gift.status === PlanGiftStatus.rejected) {
      throw new NotFoundException('No encontramos ese regalo. Revisá el link.');
    }
    const giver = await this.repository.findUserById(String(gift.giver));
    const isForViewer = await this.isForUser(gift, viewerId);
    const availability =
      gift.status === PlanGiftStatus.paid
        ? 'available'
        : gift.status === PlanGiftStatus.active
          ? 'used'
          : 'unavailable';
    return {
      code: gift.code,
      planReason: gift.planReason,
      months: gift.months,
      giverName: displayName(giver),
      availability,
      reservedForEmail: gift.recipient ? null : maskEmail(gift.recipientEmail),
      isForViewer,
      giftId: isForViewer ? String(gift._id) : null,
    };
  }

  /*
  El destinatario abre el link con su cuenta: si el regalo estaba reservado a su
  email, queda asignado a su cuenta. Un regalo de otra persona no se puede tomar.
  */
  async claim(userId: string, code: string): Promise<PlanGiftModel> {
    const gift = await this.repository.findByCode(code);
    if (!gift || gift.status === PlanGiftStatus.rejected) {
      throw new NotFoundException('No encontramos ese regalo. Revisá el link.');
    }
    if (gift.recipient && String(gift.recipient) === userId) return this.modelWithNames(gift, userId);
    if (gift.recipient) throw new ForbiddenException('Este regalo es para otra cuenta.');

    const user = await this.repository.findUserById(userId);
    if (!user?.email || normalizeEmail(user.email) !== gift.recipientEmail) {
      throw new ForbiddenException(
        'Este regalo es para otro email. Pedile a quien te lo regaló que lo cambie desde "Mis regalos".',
      );
    }
    const updated = (await this.repository.update(String(gift._id), { recipient: userId })) ?? gift;
    if (updated.status === PlanGiftStatus.paid) await this.notifyReceived(updated);
    return this.modelWithNames(updated, userId);
  }

  /** El destinatario activa el regalo: desde ahí cuentan los meses. */
  async activate(userId: string, giftId: string): Promise<PlanGiftModel> {
    const gift = await this.repository.findById(giftId);
    if (!gift || String(gift.recipient) !== userId) {
      throw new NotFoundException('No encontramos ese regalo.');
    }
    if (gift.status === PlanGiftStatus.active) return this.modelWithNames(gift, userId);
    if (gift.status !== PlanGiftStatus.paid) {
      throw new BadRequestException('Este regalo todavía no se puede activar.');
    }
    if (await this.subscriptionService.hasPaidPlan(userId)) {
      throw new BadRequestException(
        'Ya tenés un plan. Podés activar el regalo cuando termine o lo canceles.',
      );
    }

    const activatedAt = new Date();
    const expiresAt = addMonths(activatedAt, gift.months);
    const subscriptionId = await this.subscriptionService.createInternalSubscription({
      mpPreapprovalId: this.subscriptionIdFor(gift),
      subscriptionPlanId: String(gift.subscriptionPlan),
      holders: [userId],
      payerUser: String(gift.giver),
      kind: SubscriptionKind.GIFT,
      externalReference: `${EXTERNAL_REFERENCE_PREFIX.GIFT}${gift._id}`,
      expiresAt,
    });
    const updated =
      (await this.repository.update(giftId, {
        status: PlanGiftStatus.active,
        activatedAt,
        expiresAt,
        subscription: subscriptionId,
      })) ?? gift;

    const recipient = await this.repository.findUserById(userId);
    await this.notify({
      event: PlanNotificationEvent.giftActivated,
      recipients: [{ userId: String(gift.giver) }],
      data: this.notificationData(updated, displayName(recipient)),
    });
    return this.modelWithNames(updated, userId);
  }

  /** Quien regala corrige el email mientras el regalo no tiene cuenta asignada. */
  async updateEmail(giverId: string, giftId: string, email: string): Promise<PlanGiftModel> {
    const gift = await this.repository.findById(giftId);
    if (!gift || String(gift.giver) !== giverId) {
      throw new NotFoundException('No encontramos ese regalo.');
    }
    if (gift.recipient) {
      throw new BadRequestException('Este regalo ya está en la cuenta de su destinatario.');
    }
    if (![PlanGiftStatus.paid, PlanGiftStatus.pendingPayment].includes(gift.status)) {
      throw new BadRequestException('Este regalo ya no se puede cambiar.');
    }
    const normalized = normalizeEmail(email);
    const existingUser = await this.repository.findUserByEmail(normalized);
    if (existingUser) {
      if (String(existingUser._id) === giverId) {
        throw new BadRequestException('No te podés regalar un plan a vos mismo.');
      }
      if (await this.subscriptionService.hasPaidPlan(String(existingUser._id))) {
        throw new BadRequestException(ALREADY_HAS_PLAN);
      }
    }
    const updated =
      (await this.repository.update(giftId, {
        recipientEmail: normalized,
        recipient: existingUser ? String(existingUser._id) : null,
      })) ?? gift;
    if (existingUser && updated.status === PlanGiftStatus.paid) await this.notifyReceived(updated);
    return this.modelWithNames(updated, giverId);
  }

  /* ------------------------------------------------------------ consultas */

  async getMine(userId: string): Promise<MyPlanGiftsResponse> {
    const [given, received] = await Promise.all([
      this.repository.findByGiver(userId),
      this.repository.findByRecipient(userId),
    ]);
    const users = await this.usersById([...given, ...received]);
    return {
      given: given.map((gift) => this.toModel(gift, userId, users)),
      received: received.map((gift) => this.toModel(gift, userId, users)),
    };
  }

  async getAllAdmin(page: number, limit: number): Promise<AdminPlanGiftsResponse> {
    const { gifts, hasMore } = await this.repository.findAllPaginated(page, limit);
    const users = await this.usersById(gifts);
    return {
      gifts: gifts.map((gift): AdminPlanGiftModel => ({
        ...this.toModel(gift, null, users, true),
        giverEmail: users.get(String(gift.giver))?.email ?? null,
        mpPaymentId: gift.mpPaymentId,
        paymentStatus: gift.paymentStatus,
      })),
      hasMore,
    };
  }

  /* -------------------------------------------------------------- helpers */

  private async getGiftablePlan(mpPreapprovalPlanId: string) {
    const plan = await this.planService.findSubscriptionPlanByMeliID(mpPreapprovalPlanId);
    // Sólo planes pagos mensuales: los packs no se regalan y el precio es por mes.
    if (
      !plan ||
      !plan.getIsActive() ||
      plan.getIsFree() ||
      plan.getIsPack() ||
      plan.getIntervalTime() !== 30
    ) {
      throw new BadRequestException('Este plan no se puede regalar.');
    }
    let mpPlan: any;
    try {
      mpPlan = await this.fetchToMp.getDataFromMp_fetch(PREAPPROVAL_PLAN_URL + mpPreapprovalPlanId);
    } catch {
      throw new BadRequestException('Este plan no está disponible en este momento.');
    }
    const monthlyAmount = Number(mpPlan?.auto_recurring?.transaction_amount);
    if (mpPlan?.status !== 'active' || !Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
      throw new BadRequestException('Este plan no está disponible en este momento.');
    }
    return { plan, monthlyAmount };
  }

  private assertMonths(months: number) {
    const options = getGiftMonthOptions();
    if (!options.includes(months)) {
      throw new BadRequestException(`Se pueden regalar ${options.join(', ')} meses.`);
    }
  }

  /*
  A quién va el regalo: una cuenta elegida con el buscador o un email. Si ya hay
  una cuenta con ese email, va a esa cuenta. Nunca a uno mismo ni a quien ya
  tiene un plan pago (se avisa antes de cobrar).
  */
  private async resolveRecipient(
    giverId: string,
    input: BuyPlanGiftInput,
  ): Promise<{ userId: string | null; email: string | null }> {
    let user: PlanGiftUserRef | null = null;
    let email: string | null = null;
    if (input.recipientUserId) {
      user = await this.repository.findUserById(input.recipientUserId);
      if (!user) throw new BadRequestException('No encontramos a ese usuario.');
    } else if (input.recipientEmail) {
      email = normalizeEmail(input.recipientEmail);
      user = await this.repository.findUserByEmail(email);
    } else {
      throw new BadRequestException('Elegí a quién le regalás el plan.');
    }

    if (user) {
      const userId = String(user._id);
      if (userId === giverId) {
        throw new BadRequestException('No te podés regalar un plan a vos mismo.');
      }
      if (await this.subscriptionService.hasPaidPlan(userId)) {
        throw new BadRequestException(ALREADY_HAS_PLAN);
      }
      return { userId, email: user.email ? normalizeEmail(user.email) : email };
    }
    return { userId: null, email };
  }

  private async createWithUniqueCode(fields: Partial<PlanGiftRecord>): Promise<PlanGiftRecord> {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.repository.create({ ...fields, code: generateGiftCode() });
      } catch (error: any) {
        if (error?.code !== 11000) throw error;
      }
    }
    throw new BadRequestException('No pudimos generar el regalo. Probá de nuevo.');
  }

  private async isForUser(gift: PlanGiftRecord, userId?: string | null): Promise<boolean> {
    if (!userId) return false;
    if (gift.recipient) return String(gift.recipient) === userId;
    const user = await this.repository.findUserById(userId);
    return !!user?.email && normalizeEmail(user.email) === gift.recipientEmail;
  }

  private subscriptionIdFor(gift: PlanGiftRecord): string {
    return `${EXTERNAL_REFERENCE_PREFIX.GIFT}${gift._id}`;
  }

  private async usersById(gifts: PlanGiftRecord[]): Promise<Map<string, PlanGiftUserRef>> {
    const ids = new Set<string>();
    for (const gift of gifts) {
      ids.add(String(gift.giver));
      if (gift.recipient) ids.add(String(gift.recipient));
    }
    const users = await this.repository.findUsersByIds(Array.from(ids));
    return new Map(users.map((user) => [String(user._id), user]));
  }

  private async modelWithNames(gift: PlanGiftRecord, viewerId: string): Promise<PlanGiftModel> {
    return this.toModel(gift, viewerId, await this.usersById([gift]));
  }

  private toModel(
    gift: PlanGiftRecord,
    viewerId: string | null,
    users?: Map<string, PlanGiftUserRef>,
    isAdmin = false,
  ): PlanGiftModel {
    const isGiver = viewerId !== null && String(gift.giver) === viewerId;
    const isRecipient = viewerId !== null && !!gift.recipient && String(gift.recipient) === viewerId;
    const expired =
      gift.status === PlanGiftStatus.active &&
      !!gift.expiresAt &&
      new Date(gift.expiresAt).getTime() <= Date.now();
    return {
      _id: String(gift._id),
      code: gift.code,
      planReason: gift.planReason,
      months: gift.months,
      amount: gift.amount,
      status: expired ? 'expired' : gift.status,
      giverName: displayName(users?.get(String(gift.giver))),
      recipientName: gift.recipient ? displayName(users?.get(String(gift.recipient))) : null,
      recipientEmail: isGiver || isAdmin ? gift.recipientEmail : null,
      canActivate: isRecipient && gift.status === PlanGiftStatus.paid,
      link: giftLink(gift.code),
      activatedAt: gift.activatedAt ? new Date(gift.activatedAt).toISOString() : null,
      expiresAt: gift.expiresAt ? new Date(gift.expiresAt).toISOString() : null,
      createdAt: gift.createdAt ? new Date(gift.createdAt).toISOString() : null,
    };
  }

  private notificationData(gift: PlanGiftRecord, actorName: string | null) {
    return {
      kind: 'gift' as const,
      entityId: String(gift._id),
      actorName,
      planReason: gift.planReason,
      months: gift.months,
      reason: null,
    };
  }

  private async notifyReceived(gift: PlanGiftRecord): Promise<void> {
    if (!gift.recipient) return;
    const giver = await this.repository.findUserById(String(gift.giver));
    await this.notify({
      event: PlanNotificationEvent.giftReceived,
      recipients: [{ userId: String(gift.recipient) }],
      data: this.notificationData(gift, displayName(giver)),
    });
  }

  /* Un aviso que falla nunca rompe el regalo ni el cobro. */
  private async notify(payload: PlanNotificationPayload): Promise<void> {
    try {
      await this.emitter.emitAsync(plan_gift_notification, payload);
    } catch (error: any) {
      this.logger.error(`No se pudo avisar ${payload.event}: ${error?.message}`);
    }
  }
}
