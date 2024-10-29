export class UserClerkUpdateDto {
  name: string;
  lastName: string;
  username: string;
  profilePhotoUrl: string;
  email: string;
  constructor(partial: Partial<UserClerkUpdateDto> = {}) {
    Object.assign(this, partial);
  }

  get getName() {
    return this.name;
  }
  get getLastName() {
    return this.lastName;
  }
  get getUsername() {
    return this.username;
  }
  get getProfilePhotoUrl() {
    return this.profilePhotoUrl;
  }
  get getEmail() {
    return this.email;
  }
}
