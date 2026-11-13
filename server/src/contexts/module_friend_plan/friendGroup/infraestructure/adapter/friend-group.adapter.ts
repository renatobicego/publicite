import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  mp_friend_group_charge_failed,
  mp_friend_group_charge_recovered,
  mp_friend_group_preapproval,
  user_deleting,
} from 'src/contexts/module_shared/event-emmiter/events';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { FriendGroupService } from '../../application/service/friend-group.service';
import { PayFriendGroupInput } from '../../application/dto/pay-friend-group.input';

/*
Adapter entre el resolver y el servicio de Hacete Amigo, y oyente de los avisos
que le llegan de otros módulos: el webhook de MP (débito del grupo, cobro
rechazado o recuperado) y el borrado de la cuenta de un miembro.
*/
@Injectable()
export class FriendGroupAdapter {
  constructor(
    private readonly service: FriendGroupService,
    private readonly logger: MyLoggerService,
  ) {}

  getOptions() {
    return this.service.getOptions();
  }

  create(userId: string, mpPreapprovalPlanId: string) {
    return this.service.create(userId, mpPreapprovalPlanId);
  }

  invite(userId: string, groupId: string, inviteeId: string) {
    return this.service.invite(userId, groupId, inviteeId);
  }

  respondInvitation(userId: string, groupId: string, accept: boolean) {
    return this.service.respondInvitation(userId, groupId, accept);
  }

  getByInviteCode(code: string, viewerId?: string | null) {
    return this.service.getByInviteCode(code, viewerId);
  }

  joinByInviteCode(userId: string, code: string) {
    return this.service.joinByInviteCode(userId, code);
  }

  regenerateInviteCode(userId: string, groupId: string) {
    return this.service.regenerateInviteCode(userId, groupId);
  }

  removeMember(userId: string, groupId: string, memberId: string) {
    return this.service.removeMember(userId, groupId, memberId);
  }

  leave(userId: string, groupId: string) {
    return this.service.leave(userId, groupId);
  }

  getMine(userId: string) {
    return this.service.getMine(userId);
  }

  getCheckout(userId: string, groupId: string) {
    return this.service.getCheckout(userId, groupId);
  }

  pay(userId: string, input: PayFriendGroupInput) {
    return this.service.pay(userId, input);
  }

  // Si falla, el error vuelve al webhook y MP reintenta (el proceso es idempotente).
  @OnEvent(mp_friend_group_preapproval)
  async onPreapproval(payload: { groupId: string; preapproval: any }): Promise<boolean> {
    await this.service.handlePreapproval(payload.groupId, payload.preapproval);
    return true;
  }

  @OnEvent(mp_friend_group_charge_failed)
  async onChargeFailed(payload: { groupId: string }): Promise<boolean> {
    await this.service.handleChargeFailed(payload.groupId);
    return true;
  }

  @OnEvent(mp_friend_group_charge_recovered)
  async onChargeRecovered(payload: { groupId: string }): Promise<boolean> {
    await this.service.handleChargeRecovered(payload.groupId);
    return true;
  }

  // No relanza: el borrado de la cuenta sigue aunque falle el grupo (queda en el log).
  @OnEvent(user_deleting)
  async onUserDeleting(payload: { userId: string }): Promise<void> {
    try {
      await this.service.handleMemberDeleted(payload.userId);
    } catch (error: any) {
      this.logger.error(
        `No se pudo resolver el grupo de Hacete Amigo de la cuenta borrada ${payload.userId}: ${error?.message}`,
      );
    }
  }
}
