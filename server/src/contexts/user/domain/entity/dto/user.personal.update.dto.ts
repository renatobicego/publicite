export class UserPersonalUpdateDto {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: string;

  constructor(partial: Partial<UserPersonalUpdateDto> = {}) {
    Object.assign(this, partial);
  }

  get getBirthDate() {
    return this.birthDate;
  }

  get getGender() {
    return this.gender;
  }

  get getCountryRegion() {
    return this.countryRegion;
  }

  get getDescription() {
    return this.description;
  }
}
