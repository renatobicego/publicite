import { Module } from '@nestjs/common';

import { MagazineRepository } from '../repository/magazine.repository';
import { MagazineService } from '../../application/service/magazine.service';
import { MagazineAdapter } from '../controller/adapter/magazine.adapter';

@Module({
  imports: [],
  providers: [
    {
      provide: 'MagazineRepositoryInterface',
      useClass: MagazineRepository,
    },
    {
      provide: 'MagazineServiceInterface',
      useClass: MagazineService,
    },
    {
      provide: 'MagazineAdapterInterface',
      useClass: MagazineAdapter,
    },
  ],
})
export class MagazineModule {}

