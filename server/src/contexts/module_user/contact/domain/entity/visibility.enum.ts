import { registerEnumType } from '@nestjs/graphql';

export enum Visibility {
  PUBLIC = 'public',
  REGISTERED = 'registered',
  CONTACTS = 'contacts',
  FRIENDS = 'friends',
  TOPFRIENDS = 'topfriends',
}

registerEnumType(Visibility, {
  name: 'Visibility_Enum_Contact',
  description:
    'Audiencia que puede ver un campo del Contact: public | registered | contacts | friends | topfriends',
});
