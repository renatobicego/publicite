import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PostModel from '../schemas/post.schema';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PostGoodModel } from '../schemas/post-types-schemas/post.good.schema';
import { PostServiceModel } from '../schemas/post-types-schemas/post.service.schema';
import { PostPetitionModel } from '../schemas/post-types-schemas/post.petition.schema';
import { PostAdapterMapper } from '../adapter/mapper/post.adapter.mapper';
import { PostAdapter } from '../adapter/post.adapter';
import { PostResolver } from '../graphql/resolver/post.resolver';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { UserSchema } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { PostService } from '../../application/service/post.service';
import { PostRepository } from '../repository/post.repository';
import { PostReactionSchema } from '../schemas/post.reaction.schema';
import { PostCommentSchema } from '../schemas/post.comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PostModel.modelName,
        schema: PostModel.schema,
        discriminators: [
          { name: PostGoodModel.modelName, schema: PostGoodModel.schema },
          { name: PostServiceModel.modelName, schema: PostServiceModel.schema },
          {
            name: PostPetitionModel.modelName,
            schema: PostPetitionModel.schema,
          },
        ],
      },
      { name: 'User', schema: UserSchema },
      { name: 'PostReaction', schema: PostReactionSchema },
      { name: 'PostComment', schema: PostCommentSchema },
    ]),

    UserModule,
  ],
  providers: [
    MyLoggerService,
    PostResolver,
    {
      provide: 'PostMapperAdapterInterface',
      useClass: PostAdapterMapper,
    },
    {
      provide: 'PostRepositoryInterface',
      useClass: PostRepository,
    },
    {
      provide: 'PostServiceInterface',
      useClass: PostService,
    },
    {
      provide: 'PostAdapterInterface',
      useClass: PostAdapter,
    },
  ],
  exports: ['PostServiceInterface'],
})
export class PostModule { }
