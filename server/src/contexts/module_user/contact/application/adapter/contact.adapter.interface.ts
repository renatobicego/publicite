import { UpdateContactRequest } from "./dto/HTTP-REQUEST/update.contact.request";

export interface ContactAdapterInterface {
  updateContact(contactId: string, updateRequest: UpdateContactRequest): Promise<void>
}
