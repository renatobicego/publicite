import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PostModel from '../post/schemas/post.schema';

import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { PostService } from '../../application/post/service/post.service';
import { PostRepository } from '../post/repository/post.repository';
import { PostRepositoryMapper } from '../post/repository/mapper/post.repository.mapper';
import { UserModule } from 'src/contexts/user/infrastructure/module/user.module';
import { PostLocationSchema } from '../post/schemas/postLocation.schema';
import { PostGoodModel } from '../post/schemas/post-types-schemas/post.good.schema';
import { PostServiceModel } from '../post/schemas/post-types-schemas/post.service.schema';
import { PostPetitionModel } from '../post/schemas/post-types-schemas/post.petition.schema';
import { UserSchema } from 'src/contexts/user/infrastructure/schemas/user.schema';
import { PostController } from '../post/controller/post.controller';
import { PostAdapterMapper } from '../post/controller/adapter/mapper/post.adapter.mapper';
import { PostAdapter } from '../post/controller/adapter/post.adapter';
import { PostResolver } from '../post/graphql/resolver/post.resolver';

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
      { name: 'PostLocation', schema: PostLocationSchema },
      { name: 'User', schema: UserSchema },
    ]),

    UserModule,
  ],
  controllers: [PostController],
  providers: [
    MyLoggerService,
    PostResolver,
    {
      provide: 'PostRepositoryMapperInterface',
      useClass: PostRepositoryMapper,
    },

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
})
export class PostModule {}
