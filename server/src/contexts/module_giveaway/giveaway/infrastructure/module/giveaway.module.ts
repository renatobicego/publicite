import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiveawayService } from '../../application/service/giveaway.service';
import { GiveawayAdapter } from '../resolver/adapter/giveaway.adapter';
import { GiveawayResolver } from '../resolver/giveaway.resolver';
import { GiveawayRepository } from '../repository/giveaway.repository';
import { GiveawaySchema } from '../../infrastructure/schemas/giveaway.schema';
import { UserSchema } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Giveaway', schema: GiveawaySchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [
    GiveawayResolver,
    {
      provide: 'GiveawayRepositoryInterface',
      useClass: GiveawayRepository,
    },
    {
      provide: 'GiveawayServiceInterface',
      useClass: GiveawayService,
    },
    {
      provide: 'GiveawayAdapterInterface',
      useClass: GiveawayAdapter,
    },
  ],
  exports: ['GiveawayServiceInterface'],
})
export class GiveawayModule {}
