import { Module } from '@nestjs/common';

import { BoardSchema } from '../schemas/board.schema';
import { BoardController } from '../controller/board.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { BoardService } from '../../application/service/board.service';
import { BoardRepository } from '../repository/board.repository';
import { BoardServiceMapper } from '../../application/service/mapper/board.service.mapper';
import { BoardRepositoryMapper } from '../repository/mapper/board.repository.mapper';
import { BoardAdapter } from '../controller/adapter/board.adapter';
import { UserModule } from 'src/contexts/user/infraestructure/module/user.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Board', schema: BoardSchema }]),

    UserModule,
  ],

  controllers: [BoardController],
  providers: [
    MyLoggerService,
    {
      provide: 'BoardServiceInterface',
      useClass: BoardService,
    },
    {
      provide: 'BoardRepositoryInterface',
      useClass: BoardRepository,
    },
    {
      provide: 'BoardMapperServiceInterface',
      useClass: BoardServiceMapper,
    },
    {
      provide: 'BoardRepositoryMapperInterface',
      useClass: BoardRepositoryMapper,
    },
    {
      provide: 'BoardAdapterInterface',
      useClass: BoardAdapter,
    },
  ],
  exports: [],
})
export class BoardModule {}
