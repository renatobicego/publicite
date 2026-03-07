import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoveltyService } from '../../application/service/novelty.service';
import { NoveltyAdapter } from '../resolver/adapter/novelty.adapter';
import { NoveltyResolver } from '../resolver/novelty.resolver';
import { NoveltyRepository } from '../repository/novelty.repository';
import { NoveltySchema } from '../../infrastructure/schemas/novelty.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Novelty', schema: NoveltySchema }]),
  ],
  providers: [
    NoveltyResolver,
    {
      provide: 'NoveltyRepositoryInterface',
      useClass: NoveltyRepository,
    },
    {
      provide: 'NoveltyServiceInterface',
      useClass: NoveltyService,
    },
    {
      provide: 'NoveltyAdapterInterface',
      useClass: NoveltyAdapter,
    },
  ],
  exports: ['NoveltyServiceInterface'],
})
export class NoveltyModule {}
