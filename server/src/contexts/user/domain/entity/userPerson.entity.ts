import { UserType } from './enum/user.enums';
import { User } from './user.entity';

export interface UP_update {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: string;
}
export class UserPerson extends User {
  private gender: string;
  private birthDate: string;

  constructor(user: User, gender: string, birthDate: string) {
    super(
      user.getClerkId,
      user.getEmail,
      user.getUsername,
      user.getDescription,
      user.getProfilePhotoUrl,
      user.getCountryRegion,
      user.getIsActive,
      user.getName,
      user.getLastName,
      user.getContact,
      user.getCreatedTime ?? '',
      user.getSubscriptions ?? [],
      user.getGroups ?? [],
      user.getMagazines ?? [],
      user.getBoard ?? undefined,
      user.getPost ?? [],
      user.getUserRelations ?? [],
      user.getUserType ?? UserType.Person,
      user.getUserPreferences ?? {
        searchPreference: [],
        backgroundColor: undefined,
      },
      user.getId,
    );
    this.gender = gender;
    this.birthDate = birthDate;
  }

  get getGender(): string {
    return this.gender;
  }

  get getBirthDate(): string {
    return this.birthDate;
  }
}
