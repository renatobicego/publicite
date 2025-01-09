import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupRepository } from '../repository/group.repository';
import { GroupService } from '../../application/service/group.service';
import { GroupResolver } from '../graphql/resolver/group.resolver';
import { GroupAdapter } from '../adapter/group.adapter';
import { GroupSchema } from '../schemas/group.schema';
import { GroupRepositoryMapper } from '../repository/mapper/group.repository.mapper';
import { GroupServiceMapper } from '../../application/service/mapper/group.service.mapper';

import { UserSchema } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { NotificationModule } from 'src/contexts/module_user/notification/infrastructure/module/notification.module';
import { MagazineModelSharedModule } from 'src/contexts/module_shared/sharedSchemas/magazine.model.schema';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { PostModule } from 'src/contexts/module_post/post/infraestructure/module/post.module';

@Module({
  imports: [
    UserModule,
    PostModule,
    MagazineModelSharedModule,
    MongooseModule.forFeature([
      { name: 'Group', schema: GroupSchema },
      { name: 'User', schema: UserSchema },
    ]),
    forwardRef(() => NotificationModule)
    ,
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
  exports: ['GroupServiceInterface'],
})
export class GroupModule { }
