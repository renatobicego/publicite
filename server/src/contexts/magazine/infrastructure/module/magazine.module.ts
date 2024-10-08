import { Module } from '@nestjs/common';

import { MagazineRepository } from '../repository/magazine.repository';
import { MagazineService } from '../../application/service/magazine.service';
import { MagazineAdapter } from '../resolver/adapter/magazine.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { MagazineModel, MagazineSchema } from '../schemas/magazine.schema';
import { MagazineSectionModel } from '../schemas/section/magazine.section.schema';
import { MagazineResolver } from '../resolver/magazine.resolver';
import { UserMagazineModel } from '../schemas/magazine.user.schema';
import { GroupMagazineModel } from '../schemas/magazine.group.schema';
import { MagazineRepositoryMapper } from '../repository/mapper/magazine.repository.mapper';
import { UserSchema } from 'src/contexts/user/infrastructure/schemas/user.schema';
import { GroupSchema } from 'src/contexts/group/infrastructure/schemas/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MagazineModel.modelName,
        schema: MagazineModel.schema,
        discriminators: [
          {
            name: UserMagazineModel.modelName,
            schema: UserMagazineModel.schema,
          },
          {
            name: GroupMagazineModel.modelName,
            schema: GroupMagazineModel.schema,
          },
        ],
      },
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
})
export class MagazineModule {}
