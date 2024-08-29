import { ContactRequestDto } from '../../infraestructure/controller/request/contact.request';

export class Contact {
  private phone: string;
  private instagram: string;
  private facebook: string;
  private x: string;
  private website: string;

  constructor(
    phone: string,
    instagram: string,
    facebook: string,
    x: string,
    website: string,
  ) {
    this.phone = phone;
    this.instagram = instagram;
    this.facebook = facebook;
    this.x = x;
    this.website = website;
  }
  static formatDtoToEntity(contact: ContactRequestDto): Contact {
    return new Contact(
      contact.phone,
      contact.instagram,
      contact.facebook,
      contact.x,
      contact.website,
    );
  }
}
