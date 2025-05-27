import { Module } from '@nestjs/common';
import { PostCategoryRepository } from '../repository/post.category.repository';

import { PostCategorySchema } from '../schemas/post.cateogory.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PostCategoryService } from '../../application/service/post.category.service';
import { PostCategoryAdapter } from '../resolver/adapter/post.category.adapter';
import { PostCategoryResolver } from '../resolver/post.category.resolver';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PostCategory', schema: PostCategorySchema },
    ]),
  ],
  controllers: [],
  providers: [
    MyLoggerService,
    PostCategoryResolver,
    {
      provide: 'PostCategoryRepositoryInterface',
      useClass: PostCategoryRepository,
    },
    {
      provide: 'PostCategoryServiceInterface',
      useClass: PostCategoryService,
    },
    {
      provide: 'PostCategoryServiceInterface',
      useClass: PostCategoryService,
    },
    {
      provide: 'PostCategoryAdapterInterface',
      useClass: PostCategoryAdapter,
    },
  ],
})
export class PostCategoryModule {}
