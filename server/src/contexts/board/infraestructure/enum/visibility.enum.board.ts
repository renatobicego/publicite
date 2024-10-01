import { registerEnumType } from '@nestjs/graphql';

export enum Visibility {
  everyone = 'everyone',
  contacts = 'contacts',
  friends = 'friends',
  topfriends = 'topfriends',
}

registerEnumType(Visibility, {
  name: 'Visibility_Enum_board',
});
