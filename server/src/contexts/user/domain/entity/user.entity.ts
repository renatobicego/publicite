export class User {
  private firstName: string;
  private lastName: string;
  private imageUrl: string;

  constructor(firstName: string, lastName: string, imageUrl: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.imageUrl = imageUrl;
  }
}
