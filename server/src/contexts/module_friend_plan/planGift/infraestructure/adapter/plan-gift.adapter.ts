import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { mp_gift_payment, user_created } from 'src/contexts/module_shared/event-emmiter/events';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PlanGiftService } from '../../application/service/plan-gift.service';
import { BuyPlanGiftInput } from '../../application/dto/buy-plan-gift.input';

/*
Adapter entre el resolver y el servicio de regalos, y oyente de los eventos que
le llegan de otros módulos: el pago de MP de un regalo (lo pasa el webhook) y el
alta de un usuario (para asignarle los regalos hechos a su email).
*/
@Injectable()
export class PlanGiftAdapter {
  constructor(
    private readonly service: PlanGiftService,
    private readonly logger: MyLoggerService,
  ) {}

  getQuote(mpPreapprovalPlanId: string, months: number) {
    return this.service.getQuote(mpPreapprovalPlanId, months);
  }

  buy(giverId: string, input: BuyPlanGiftInput) {
    return this.service.buy(giverId, input);
  }

  getByCode(code: string, viewerId?: string | null) {
    return this.service.getByCode(code, viewerId);
  }

  claim(userId: string, code: string) {
    return this.service.claim(userId, code);
  }

  activate(userId: string, giftId: string) {
    return this.service.activate(userId, giftId);
  }

  updateEmail(giverId: string, giftId: string, email: string) {
    return this.service.updateEmail(giverId, giftId, email);
  }

  getMine(userId: string) {
    return this.service.getMine(userId);
  }

  getAllAdmin(page: number, limit: number) {
    return this.service.getAllAdmin(page, limit);
  }

  // Si falla, el error vuelve al webhook y MP reintenta (el proceso es idempotente).
  @OnEvent(mp_gift_payment)
  async onGiftPayment(payload: { giftId: string; payment: any }): Promise<boolean> {
    await this.service.handleMpPayment(payload.giftId, payload.payment);
    return true;
  }

  // No relanza: el alta de la cuenta no puede fallar por un regalo.
  @OnEvent(user_created)
  async onUserCreated(payload: { userId: string; email: string }): Promise<void> {
    try {
      await this.service.assignByEmail(payload.userId, payload.email);
    } catch (error: any) {
      this.logger.error(
        `No se pudieron asignar los regalos del email del usuario ${payload.userId}: ${error?.message}`,
      );
    }
  }
}
