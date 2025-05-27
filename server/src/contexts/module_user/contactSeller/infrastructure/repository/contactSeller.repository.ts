import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ContactSellerDocument,
  ContactSellerModel,
} from '../schema/contactSeller.schema';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ContactSellerRepositoryInterface } from '../../domain/repository/contactSeller.repository.interface';

export class ContactSellerRepository
  implements ContactSellerRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel(ContactSellerModel.modelName)
    private readonly contactSellerModel: Model<ContactSellerDocument>,
  ) { }

  async getContactSellerById(condition: object, limit: number, page: number): Promise<any> {
    try {
      const contactSeller = await this.contactSellerModel
        .find(condition)
        .populate({
          path: 'post',
          model: 'Post',
          select:
            '_id title description postType price imagesUrls petitionType toPrice frequencyPrice',
        })
        .limit(limit + 1)
        .skip((page - 1) * limit)
        .lean()
      if (contactSeller.length <= 0) {
        return {
          contactSeller: [],
          hasMore: false
        }
      }
      const hasMore = contactSeller.length > limit


      return {
        contactSeller: contactSeller.slice(0, limit),
        hasMore: hasMore
      }


    } catch (error: any) {
      throw error;
    }
  }

  async save(contactSeller: any): Promise<boolean> {
    try {
      const newContactSeller = new this.contactSellerModel(contactSeller);
      const result = await newContactSeller.save();
      if (result) {
        this.logger.log('Saving contactSeller in repository success');
        return true;
      } else {
        this.logger.log('ERROR saving contactSeller in repository ');
        return false;
      }
    } catch (error: any) {
      throw error;
    }
  }

  async setOpinionRequestInTrue(_id: any): Promise<any> {
    try {
      this.logger.log('Setting opinion request in true');
      await this.contactSellerModel.updateOne(
        { _id },
        { $set: { isOpinionRequested: true } },
      );
    } catch (error: any) {
      this.logger.log('ERROR setting opinion request in true');
      throw error;
    }
  }
}
