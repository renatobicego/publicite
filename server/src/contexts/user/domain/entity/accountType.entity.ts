export class AccountType {
  private name: string;
  private publicationsLimit: number;
  constructor(name: string, publicationsLimit: number) {
    this.name = name;
    this.publicationsLimit = publicationsLimit;
  }
}
