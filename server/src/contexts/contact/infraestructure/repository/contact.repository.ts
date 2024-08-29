import { InjectModel } from '@nestjs/mongoose';
import { ContactRepositoryInterface } from '../../domain/repository/contact.repository.interface';
import { Contact } from '../../domain/entity/contact.entity';
import { ContactDocument } from '../schema/contact.schema';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { Model, Types } from 'mongoose';

export class ContactRepository implements ContactRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Contact')
    private readonly contactModel: Model<ContactDocument>,
  ) {}
  async createContact(contact: Contact): Promise<Types.ObjectId> {
    try {
      this.logger.log('Creating contact schema');
      const contactDocument = new this.contactModel(contact);
      const result = await contactDocument.save();
      return result._id;
    } catch (error) {
      throw error;
    }
  }
}
