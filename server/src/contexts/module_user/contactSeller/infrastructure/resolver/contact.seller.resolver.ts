import { Args, Resolver, Query } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import {
  ContactSeller_Graphql,
  ContactSellerGetType,
} from '../../domain/graphql/contactSeller.model';
import { ContactSellerAdapterInterface } from '../../application/adapter/contactSeller.adapter.interface';

@Resolver()
export class ContactSellerResolver {
  constructor(
    @Inject('ContactSellerAdapterInterface')
    private readonly contactSellerAdapter: ContactSellerAdapterInterface,
  ) {}

  @Query(() => [ContactSeller_Graphql], {
    nullable: true,
    description: 'Obtiene las peticiones de contacto por post o por usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async getContactSellerById(
    @Args('contactSellerGetType', { type: () => ContactSellerGetType })
    contactSellerGetType: ContactSellerGetType,
    @Args('_id', { type: () => String }) _id: string,
  ): Promise<ContactSeller_Graphql[] | null> {
    try {
      return await this.contactSellerAdapter.getContactSellerById(
        contactSellerGetType,
        _id,
      );
    } catch (error: any) {
      throw error;
    }
  }
}
