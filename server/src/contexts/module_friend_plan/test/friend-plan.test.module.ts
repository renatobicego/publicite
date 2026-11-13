import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

import { ContactModule } from 'src/contexts/module_user/contact/infrastructure/module/contact.module';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { EmmiterModule } from 'src/contexts/module_shared/event-emmiter/emiter.module';
import { LoggerModule } from 'src/contexts/module_shared/logger/logger.module';
import { UserBusinessModel } from 'src/contexts/module_user/user/infrastructure/schemas/userBussiness.schema';
import { UserPersonModel } from 'src/contexts/module_user/user/infrastructure/schemas/userPerson.schema';
import { UserModel } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { MpInvoiceService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-invoice.service';
import { MpPaymentService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-payment.service';
import { MpSubscriptionService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-subscription.service';
import { MercadoPagoSubscriptionPlanService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-subscriptionPlan.service';
import { MercadoPagoPaymentsRepository } from 'src/contexts/module_webhook/mercadopago/infastructure/repository/mp-payments.repository';
import { SubscriptionRepository } from 'src/contexts/module_webhook/mercadopago/infastructure/repository/mp-subscription.repository';
import { MercadoPagoSubscriptionPlanRepository } from 'src/contexts/module_webhook/mercadopago/infastructure/repository/mp-subscriptionPlan.repository';
import { MpInvoiceRepository } from 'src/contexts/module_webhook/mercadopago/infastructure/repository/mp-invoice.repository';
import { ErrorSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/error.schema';
import { InvoiceSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/invoice.schema';
import { PaymentSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/payment.schema';
import { SubscriptionSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema';
import { SubscriptionPlanSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema';
import { ErrorService } from 'src/contexts/module_webhook/mercadopago/application/service/error/error.service.interface';
import { ErrorRepository } from 'src/contexts/module_webhook/mercadopago/infastructure/repository/error/error.repository';
import { PostSchema } from 'src/contexts/module_post/post/infraestructure/schemas/post.schema';
import { PlanGiftSchema } from '../planGift/infraestructure/schemas/plan-gift.schema';
import { FRIEND_GROUP_PROVIDERS, PLAN_GIFT_PROVIDERS } from '../infraestructure/module/friend-plan.module';
import { FriendGroupSchema } from '../friendGroup/infraestructure/schemas/friend-group.schema';

/*
Módulo de test de planes compartidos (regalos y Hacete Amigo), contra la base de
tests (.env.test). MercadoPago se mockea en cada spec reemplazando fetchToMp.
*/
export async function friendPlanTestingModule(): Promise<TestingModule> {
  dotenv.config({ path: '.env.test' });

  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
      MongooseModule.forRootAsync({
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('DATABASE_URI'),
        }),
        inject: [ConfigService],
      }),
      ContactModule,
      LoggerModule,
      EventEmitterModule.forRoot(),
      EmmiterModule,
      MongooseModule.forFeature([
        { name: 'Subscription', schema: SubscriptionSchema },
        { name: UserModel.modelName, schema: UserModel.schema },
        { name: 'Invoice', schema: InvoiceSchema },
        { name: 'Payment', schema: PaymentSchema },
        { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
        { name: 'Error', schema: ErrorSchema },
        { name: 'Post', schema: PostSchema },
        { name: 'PlanGift', schema: PlanGiftSchema },
        { name: 'FriendGroup', schema: FriendGroupSchema },
      ]),
      UserModule,
    ],
    providers: [
      MyLoggerService,
      { provide: 'SubscriptionRepositoryInterface', useClass: SubscriptionRepository },
      { provide: 'SubscriptionServiceInterface', useClass: MpSubscriptionService },
      {
        provide: 'MercadoPagoSubscriptionPlanServiceInterface',
        useClass: MercadoPagoSubscriptionPlanService,
      },
      {
        provide: 'MercadoPagoSubscriptionPlanRepositoryInterface',
        useClass: MercadoPagoSubscriptionPlanRepository,
      },
      { provide: 'MpServiceInvoiceInterface', useClass: MpInvoiceService },
      { provide: 'MercadoPagoInvoiceRepositoryInterface', useClass: MpInvoiceRepository },
      { provide: 'MpPaymentServiceInterface', useClass: MpPaymentService },
      { provide: 'MercadoPagoPaymentsRepositoryInterface', useClass: MercadoPagoPaymentsRepository },
      { provide: 'ErrorServiceInterface', useClass: ErrorService },
      { provide: 'ErrorRepositoryInterface', useClass: ErrorRepository },
      { provide: 'FetchToMpInterface', useValue: {} },
      ...PLAN_GIFT_PROVIDERS,
      ...FRIEND_GROUP_PROVIDERS,
      { provide: getModelToken(UserPersonModel.modelName), useValue: {} },
      { provide: getModelToken(UserBusinessModel.modelName), useValue: {} },
    ],
  }).compile();
}
