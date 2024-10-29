import { ObjectId } from 'mongoose';

export class UserPreferencesEntityDto {
  private searchPreference: ObjectId[];
  private backgroundColor: number | undefined;

  constructor(
    searchPreference: ObjectId[] | [],
    backgroundColor: number | undefined,
  ) {
    this.searchPreference = searchPreference ?? [];
    this.backgroundColor = backgroundColor ?? undefined;
  }

  get getSearchPreference() {
    return this.searchPreference;
  }

  get getBackgroundColor() {
    return this.backgroundColor;
  }
}
