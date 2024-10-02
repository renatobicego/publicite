import { ApiTags } from '@nestjs/swagger';
import { Controller, Inject } from '@nestjs/common';
import { ContactAdapterInterface } from '../../application/adapter/contact.adapter.interface';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(
    @Inject('ContactAdapterInterface')
    private readonly contactAdapter: ContactAdapterInterface,
  ) {}
}
