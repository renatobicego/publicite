import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LoggerModule } from 'src/contexts/module_shared/logger/logger.module';
import { UserModel } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { MercadoPagoModule } from 'src/contexts/module_webhook/mercadopago/infastructure/module/mercadopago.module';
import { PlanGiftSchema } from '../../planGift/infraestructure/schemas/plan-gift.schema';
import { PlanGiftRepository } from '../../planGift/infraestructure/repository/plan-gift.repository';
import { PlanGiftService } from '../../planGift/application/service/plan-gift.service';
import { PlanGiftAdapter } from '../../planGift/infraestructure/adapter/plan-gift.adapter';
import { PlanGiftResolver } from '../../planGift/infraestructure/resolver/plan-gift.resolver';
import { FriendGroupSchema } from '../../friendGroup/infraestructure/schemas/friend-group.schema';
import { FriendGroupRepository } from '../../friendGroup/infraestructure/repository/friend-group.repository';
import { FriendGroupService } from '../../friendGroup/application/service/friend-group.service';
import { FriendGroupAdapter } from '../../friendGroup/infraestructure/adapter/friend-group.adapter';
import { FriendGroupResolver } from '../../friendGroup/infraestructure/resolver/friend-group.resolver';
import { MpMockService } from '../../mpMock/mp-mock.service';
import { MpMockResolver } from '../../mpMock/mp-mock.resolver';

/*
Planes compartidos: regalos de planes (planGift) y Hacete Amigo (friendGroup).
Cobra con MercadoPago a través de lo que exporta MercadoPagoModule; el webhook de
MP le avisa por eventos (mp.gift_payment, mp.friend_group_*).
*/
export const PLAN_GIFT_PROVIDERS = [
  PlanGiftService,
  PlanGiftAdapter,
  PlanGiftResolver,
  { provide: 'PlanGiftRepositoryInterface', useClass: PlanGiftRepository },
];

export const FRIEND_GROUP_PROVIDERS = [
  FriendGroupService,
  FriendGroupAdapter,
  FriendGroupResolver,
  { provide: 'FriendGroupRepositoryInterface', useClass: FriendGroupRepository },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PlanGift', schema: PlanGiftSchema },
      { name: 'FriendGroup', schema: FriendGroupSchema },
      { name: UserModel.modelName, schema: UserModel.schema },
    ]),
    MercadoPagoModule,
    LoggerModule,
  ],
  // MpMock*: simulador de avisos de MP para desarrollo local (sólo responde con MP_MOCK).
  providers: [...PLAN_GIFT_PROVIDERS, ...FRIEND_GROUP_PROVIDERS, MpMockService, MpMockResolver],
})
export class FriendPlanModule {}
