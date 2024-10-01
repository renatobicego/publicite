import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';

import { ContactRepositoryInterface } from '../../domain/repository/contact.repository.interface';
import { Contact } from '../../domain/entity/contact.entity';
import { ContactDocument } from '../../infrastructure/schema/contact.schema';

@Injectable()
export class ContactRepository implements ContactRepositoryInterface {
  constructor(
    @InjectModel('Contact')
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async createContact(
    contact: Contact,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId> {
    const createdContact = new this.contactModel({
      phone: contact.getPhone(),
      instagram: contact.getInstagram(),
      facebook: contact.getFacebook(),
      x: contact.getX(),
      website: contact.getWebsite(),
    });
    await createdContact.save({ session: options?.session });
    return createdContact._id;
  }
}
