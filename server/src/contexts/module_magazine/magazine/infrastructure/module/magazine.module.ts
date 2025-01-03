import { Module } from '@nestjs/common';

import { MagazineRepository } from '../repository/magazine.repository';
import { MagazineService } from '../../application/service/magazine.service';
import { MagazineAdapter } from '../resolver/adapter/magazine.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { MagazineSchema } from '../schemas/magazine.schema';
import { MagazineSectionModel } from '../schemas/section/magazine.section.schema';
import { MagazineResolver } from '../resolver/magazine.resolver';
import { MagazineRepositoryMapper } from '../repository/mapper/magazine.repository.mapper';
import { GroupSchema } from 'src/contexts/module_group/group/infrastructure/schemas/group.schema';
import { UserSchema } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { MagazineModelSharedModule } from 'src/contexts/module_shared/sharedSchemas/magazine.model.schema';

@Module({
  imports: [
    MagazineModelSharedModule,
    MongooseModule.forFeature([
      { name: 'MagazineSection', schema: MagazineSectionModel.schema },
      { name: 'Magazine', schema: MagazineSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Group', schema: GroupSchema },
    ]),
  ],
  providers: [
    MagazineResolver,
    {
      provide: 'MagazineRepositoryInterface',
      useClass: MagazineRepository,
    },
    {
      provide: 'UserMagazineAllowedVerificationsInterface',
      useClass: MagazineRepository,
    },
    {
      provide: 'MagazineServiceInterface',
      useClass: MagazineService,
    },
    {
      provide: 'MagazineAdapterInterface',
      useClass: MagazineAdapter,
    },
    {
      provide: 'MagazineRepositoryMapperInterface',
      useClass: MagazineRepositoryMapper,
    },
  ],
  exports: ['MagazineServiceInterface', /*'MagazineRepositoryInterface'*/],
})
export class MagazineModule { }
