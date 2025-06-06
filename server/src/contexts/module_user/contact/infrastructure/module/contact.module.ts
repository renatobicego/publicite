import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


import { ContactAdapter } from '../adapter/contact.adapter';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ContactService } from '../../application/service/contact.service';
import { ContactRepository } from '../repository/contact.repository';
import { ContactSchema } from '../schema/contact.schema';
import { ContactResolver } from '../controller/contact.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Contact', schema: ContactSchema }]),
  ],
  providers: [
    ContactResolver,
    MyLoggerService,
    ContactService,
    ContactRepository,
    {
      provide: 'ContactAdapterInterface',
      useClass: ContactAdapter,
    },
    {
      provide: 'ContactServiceInterface',
      useClass: ContactService,
    },
    {
      provide: 'ContactRepositoryInterface',
      useClass: ContactRepository,
    },
  ],
  exports: [
    ContactService,
    {
      provide: 'ContactServiceInterface',
      useClass: ContactService,
    },
    {
      provide: 'ContactRepositoryInterface',
      useClass: ContactRepository,
    },
  ],
})
export class ContactModule { }
