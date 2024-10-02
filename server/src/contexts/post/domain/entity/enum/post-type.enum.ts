import { registerEnumType } from '@nestjs/graphql';

export enum PostType {
  Good = 'good',
  Service = 'service',
  Petition = 'petition',
}

registerEnumType(PostType, {
  name: 'PostType',
  description: 'Type of the post ',
});
