
import { Inject, UseGuards } from '@nestjs/common';
import { ContactAdapterInterface } from '../../application/adapter/contact.adapter.interface';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { UpdateContactRequest } from '../../application/adapter/dto/HTTP-REQUEST/update.contact.request';


@Resolver('contact')
export class ContactResolver {
  constructor(
    @Inject('ContactAdapterInterface')
    private readonly contactAdapter: ContactAdapterInterface,
  ) { }



  @Mutation(() => String, {
    nullable: true,
    description: 'Actualizar los metodos de contacto de un usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async updateContactById(
    @Args('contactId', { type: () => String }) contactId: string,
    @Args('updateRequest', { type: () => UpdateContactRequest }) updateRequest: UpdateContactRequest,
  ) {
    try {
      return await this.contactAdapter.updateContact(contactId, updateRequest);
    } catch (error: any) {
      throw error;
    }

  }

}
