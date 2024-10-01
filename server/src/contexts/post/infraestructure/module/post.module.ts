import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PostModel from '../schemas/post.schema';
import { PostController } from '../controller/post.controller';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { PostService } from '../../application/service/post.service';
import { PostRepository } from '../repository/post.repository';
import { PostRepositoryMapper } from '../repository/mapper/post.repository.mapper';
import { PostAdapterMapper } from '../controller/adapter/mapper/post.adapter.mapper';
import { UserModule } from 'src/contexts/user/infraestructure/module/user.module';
import { PostAdapter } from '../controller/adapter/post.adapter';
import { PostLocationSchema } from '../schemas/postLocation.schema';
import { PostGoodModel } from '../schemas/post-types-schemas/post.good.schema';
import { PostServiceModel } from '../schemas/post-types-schemas/post.service.schema';
import { PostPetitionModel } from '../schemas/post-types-schemas/post.petition.schema';

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
    ]),
    MongooseModule.forFeature([
      { name: 'PostLocation', schema: PostLocationSchema },
    ]),
    UserModule,
  ],
  controllers: [PostController],
  providers: [
    MyLoggerService,
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