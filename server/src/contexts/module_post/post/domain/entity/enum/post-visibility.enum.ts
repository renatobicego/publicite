import { registerEnumType } from '@nestjs/graphql';

export enum Visibility {
  public = 'public',
  registered = 'registered',
  contacts = 'contacts',
  friends = 'friends',
  topfriends = 'topfriends',
}

registerEnumType(Visibility, {
  name: 'Visibility_of_the_post',
  description: 'Visibility of the post ',
});

//---------------------------

export enum Visibility_Of_Find {
  public = 'public',
  contacts = 'contacts',
  friends = 'friends',
  topfriends = 'topfriends',
  hierarchy = 'hierarchy',
}

registerEnumType(Visibility_Of_Find, {
  name: 'Visibility_Of_Find',
  description: 'Visibility_Of_Find ',
});


//---------------------------
export enum Visibility_Of_Social_Media {
  public = 'public',
  registered = 'registered',
}

registerEnumType(Visibility_Of_Social_Media, {
  name: 'Visibility_Of_Social_Media',
  description: 'Visibility_Of_Social_Media ',
});

