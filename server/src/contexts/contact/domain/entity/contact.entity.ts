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

  public getPhone() {
    return this.phone;
  }
  public getInstagram() {
    return this.instagram;
  }
  public getFacebook() {
    return this.facebook;
  }
  public getX() {
    return this.x;
  }
  public getWebsite() {
    return this.website;
  }
}
