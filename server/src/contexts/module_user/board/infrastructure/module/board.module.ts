import { Module } from '@nestjs/common';

import { BoardSchema } from '../schemas/board.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { BoardService } from '../../application/service/board.service';
import { BoardRepository } from '../repository/board.repository';
import { BoardServiceMapper } from '../../application/service/mapper/board.service.mapper';
import { BoardRepositoryMapper } from '../repository/mapper/board.repository.mapper';
import { BoardAdapter } from '../controller/adapter/board.adapter';

import { BoardResolver } from '../graphql/resolver/board.resolver';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { UserModel } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Board', schema: BoardSchema },
      { name: UserModel.modelName, schema: UserModel.schema },
    ]),
    UserModule,
  ],

  providers: [
    MyLoggerService,
    BoardResolver,
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
