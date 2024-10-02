import { registerEnumType } from '@nestjs/graphql';

export enum Visibility {
  Public = 'public',
  Registgered = 'registered',
  Contacts = 'contacts',
  Friends = 'friends',
  TopFriends = 'topfriends',
}

registerEnumType(Visibility, {
  name: 'Visibility_of_the_post',
  description: 'Visibility of the post ',
});
