import { registerEnumType } from '@nestjs/graphql';

export enum Visibility {
  public = 'public',
  private = 'private',
}

registerEnumType(Visibility, {
  name: 'Visibility_Enum_Group',
});
