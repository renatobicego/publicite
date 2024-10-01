import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupRepository } from '../repository/group.repository';
import { GroupService } from '../../application/service/group.service';
import { GroupResolver } from '../graphql/resolver/group.resolver';
import { GroupAdapter } from '../adapter/group.adapter';
import { GroupSchema } from '../schemas/group.schema';
import { GroupRepositoryMapper } from '../repository/mapper/group.repository.mapper';
import { GroupServiceMapper } from '../../application/service/mapper/group.service.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Group', schema: GroupSchema }]),
  ],
  controllers: [],
  providers: [
    GroupResolver,
    {
      provide: 'GroupRepositoryInterface',
      useClass: GroupRepository,
    },
    {
      provide: 'GroupServiceInterface',
      useClass: GroupService,
    },
    {
      provide: 'GroupAdapterInterface',
      useClass: GroupAdapter,
    },
    {
      provide: 'GroupRepositoryMapperInterface',
      useClass: GroupRepositoryMapper,
    },
    {
      provide: 'GroupServiceMapperInterface',
      useClass: GroupServiceMapper,
    },
  ],
})
export class GroupModule {}
