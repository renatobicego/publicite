import { registerEnumType } from '@nestjs/graphql';

export enum OwnerType {
  user = 'user',
  group = 'group',
}

registerEnumType(OwnerType, {
  name: 'OwnerType',
  description: 'Owner type of the magazine',
});
