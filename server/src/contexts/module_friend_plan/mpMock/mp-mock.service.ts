import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { isMpMockEnabled } from 'src/contexts/module_shared/mp-mock/mp-mock.config';
import { getFriendPlanPaymentFailedDays } from 'src/contexts/module_shared/friend-plan/friend.plan.config';
import { FetchToMpInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/out/fech.to.mp.interface';
import {
  statusOfSubscription,
  SubscriptionServiceInterface,
} from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import { FriendGroupService } from '../friendGroup/application/service/friend-group.service';
import { FriendGroupRepositoryInterface } from '../friendGroup/domain/repository/friend-group.repository.interface';
import { FriendGroupMemberStatus } from '../friendGroup/domain/entity/friend-group.types';
import { PlanGiftService } from '../planGift/application/service/plan-gift.service';
import { PlanGiftRepositoryInterface } from '../planGift/domain/repository/plan-gift.repository.interface';

export type MpMockFriendGroupEvent =
  | 'charge_failed'
  | 'charge_recovered'
  | 'payment_failed_expired'
  | 'cancelled_in_mp';

/*
Simulador de los avisos de MercadoPago, SÓLO con MP_MOCK (desarrollo local).
Con MP simulado no llegan webhooks: esto hace lo mismo que haría el webhook
(pausar o reactivar la suscripción y avisar al módulo) para ver esas pantallas.
*/
@Injectable()
export class MpMockService {
  constructor(
    private readonly friendGroupService: FriendGroupService,
    private readonly planGiftService: PlanGiftService,
    @Inject('FriendGroupRepositoryInterface')
    private readonly groups: FriendGroupRepositoryInterface,
    @Inject('PlanGiftRepositoryInterface')
    private readonly gifts: PlanGiftRepositoryInterface,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('FetchToMpInterface')
    private readonly fetchToMp: FetchToMpInterface,
  ) {}

  async friendGroupEvent(
    userId: string,
    groupId: string,
    event: MpMockFriendGroupEvent,
  ): Promise<boolean> {
    this.assertEnabled();
    const group = await this.groups.findById(groupId);
    const member = group?.members.find((m) => String(m.user) === userId);
    if (!group || member?.status !== FriendGroupMemberStatus.accepted) {
      throw new NotFoundException('No encontramos ese grupo.');
    }
    const preapprovalId = group.mpPreapprovalId;
    if (!preapprovalId) throw new BadRequestException('El grupo todavía no tiene débito.');

    switch (event) {
      case 'charge_failed':
        await this.subscriptionService.changeStatusOfSubscription(
          preapprovalId,
          statusOfSubscription.PAUSED,
        );
        await this.friendGroupService.handleChargeFailed(groupId);
        return true;
      case 'charge_recovered':
        await this.subscriptionService.changeStatusOfSubscription(
          preapprovalId,
          statusOfSubscription.AUTHORIZED,
        );
        await this.friendGroupService.handleChargeRecovered(groupId);
        return true;
      case 'payment_failed_expired': {
        // Corre la fecha del rechazo: al volver a leer el grupo se cancela por plazo.
        const days = getFriendPlanPaymentFailedDays() + 1;
        await this.groups.update(groupId, {
          paymentFailedAt: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        });
        return true;
      }
      case 'cancelled_in_mp': {
        const preapproval = await this.fetchToMp.updatePreapproval(preapprovalId, {
          status: 'cancelled',
        });
        await this.friendGroupService.handlePreapproval(groupId, {
          ...preapproval,
          id: preapprovalId,
          status: 'cancelled',
          auto_recurring: { transaction_amount: group.totalAmount },
        });
        return true;
      }
      default:
        throw new BadRequestException('Evento desconocido.');
    }
  }

  /** Devolución del pago de un regalo desde MP (lo simula quien regaló). */
  async refundGift(userId: string, giftId: string): Promise<boolean> {
    this.assertEnabled();
    const gift = await this.gifts.findById(giftId);
    if (!gift || String(gift.giver) !== userId) throw new NotFoundException('No encontramos ese regalo.');
    if (!gift.mpPaymentId) throw new BadRequestException('El regalo no tiene un pago.');
    await this.planGiftService.handleMpPayment(giftId, {
      id: gift.mpPaymentId,
      status: 'refunded',
      status_detail: 'refunded',
      transaction_amount: gift.amount,
      currency_id: 'ARS',
      external_reference: `gift:${giftId}`,
    });
    return true;
  }

  private assertEnabled(): void {
    if (!isMpMockEnabled()) {
      throw new ForbiddenException('El simulador de MercadoPago sólo funciona en local con MP_MOCK.');
    }
  }
}
