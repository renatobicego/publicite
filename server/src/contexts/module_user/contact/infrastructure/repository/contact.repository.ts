import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ContactRepositoryInterface } from '../../domain/repository/contact.repository.interface';
import { Contact } from '../../domain/entity/contact.entity';
import { ContactDocument } from '../../infrastructure/schema/contact.schema';

@Injectable()
export class ContactRepository implements ContactRepositoryInterface {
  constructor(
    @InjectModel('Contact')
    private readonly contactModel: Model<ContactDocument>,
  ) { }


  async createContact(
    contact: Contact,
    session: any,
  ): Promise<Types.ObjectId> {
    const createdContact = new this.contactModel({
      phone: contact.getPhone(),
      phoneVisibility: contact.getPhoneVisibility(),
      instagram: contact.getInstagram(),
      instagramVisibility: contact.getInstagramVisibility(),
      facebook: contact.getFacebook(),
      facebookVisibility: contact.getFacebookVisibility(),
      x: contact.getX(),
      xVisibility: contact.getXVisibility(),
      website: contact.getWebsite(),
      websiteVisibility: contact.getWebsiteVisibility(),
      profesion: contact.getProfesion(),
      curriculum: contact.getCurriculum(),
      description: contact.getDescription(),
      links: contact.getLinks(),
    });
    await createdContact.save({ session: session });
    return createdContact._id as Types.ObjectId;
  }

  async updateContact(contactId: string, updateRequest: any): Promise<any> {
    try {
      const result = await this.contactModel.updateOne({ _id: contactId }, updateRequest);

      if (result.matchedCount === 0) return 'No changes, contact not updated or not found';
      return 'Contact updated';

    } catch (error: any) {
      throw error;
    }
  }

}
