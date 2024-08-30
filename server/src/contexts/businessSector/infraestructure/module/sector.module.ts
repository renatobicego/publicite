import { Module } from '@nestjs/common';
import { SectorSchema } from '../schema/sector.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SectorRepository } from '../repository/sector.repository';

import { SectorAdapter } from '../adapter/sector.adapter';
import { SectorController } from '../controller/sector.controller';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SectorService } from '../../application/service/sector.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Sector', schema: SectorSchema }]),
  ],
  controllers: [SectorController],
  providers: [
    MyLoggerService,
    {
      provide: 'SectorRepositoryInterface',
      useClass: SectorRepository,
    },
    {
      provide: 'SectorServiceInterface',
      useClass: SectorService,
    },
    {
      provide: 'SectorAdapterInterface',
      useClass: SectorAdapter,
    },
  ],
})
export class SectorModule {}
