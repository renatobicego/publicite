import { registerEnumType } from '@nestjs/graphql';

export enum Visibility {
  public = 'public',
  registered = 'registered',
  contacts = 'contacts',
  friends = 'friends',
  topfriends = 'topfriends',
}

registerEnumType(Visibility, {
  name: 'Visibility_Enum_board',
});