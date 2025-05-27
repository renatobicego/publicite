import { ContactSellerAdapterInterface } from '../application/adapter/contactSeller.adapter.interface';
import { OnEvent } from '@nestjs/event-emitter';

import {
  contact_seller_new_request,
  set_OpinionRequested_TRUE,
} from 'src/contexts/module_shared/event-emmiter/events';
import { ContactSeller } from '../domain/contactSeller.entity';
import { Inject } from '@nestjs/common';
import { ContactSellerServiceInterface } from '../domain/service/contactSeller.service.interface';
import { ContactSellerGetType } from '../domain/model/contactSeller.model';
interface ContactSeller_model {
  post: any;
  client: {
    clientId: string | undefined;
    name: string;
    email: string;
    lastName: string;
    username: string;
    phone: string;
    message: string;
  };
  notification_id: any;
  owner: any;
}

export class ContactSellerAdapter implements ContactSellerAdapterInterface {
  constructor(
    @Inject('ContactSellerServiceInterface')
    private readonly contactSellerService: ContactSellerServiceInterface,
  ) { }

  @OnEvent(set_OpinionRequested_TRUE)
  async setToOpinionRequestInTrue(_id: any): Promise<any> {
    try {
      return await this.contactSellerService.setOpinionRequestInTrue(_id);
    } catch (error: any) {
      throw error;
    }
  }

  @OnEvent(contact_seller_new_request)
  async createContactSeller(
    contactSeller: ContactSeller_model,
  ): Promise<boolean> {
    try {
      const today = new Date();

      const contactSellerEntity = new ContactSeller(
        contactSeller.post,
        contactSeller.client,
        contactSeller.notification_id,
        contactSeller.owner,
        today,
        false,
      );

      return await this.contactSellerService.createContactSeller(
        contactSellerEntity,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getContactSellerById(
    contactSellerGetType: ContactSellerGetType,
    _id: string,
    limit: number,
    page: number,
  ): Promise<any> {
    try {
      return await this.contactSellerService.getContactSellerById(
        contactSellerGetType,
        _id,
        limit,
        page
      );
    } catch (error: any) {
      throw error;
    }
  }
}
