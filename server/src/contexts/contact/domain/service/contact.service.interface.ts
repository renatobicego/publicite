import { ClientSession, Types } from 'mongoose';
import { ContactRequest } from 'src/contexts/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';

export interface ContactServiceInterface {
  createContact(
    contact: ContactRequest,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;
}
