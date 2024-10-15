import { registerEnumType } from '@nestjs/graphql';

export enum PostType {
  good = 'good',
  service = 'service',
  petition = 'petition',
}

registerEnumType(PostType, {
  name: 'PostType',
  description: 'Type of the post ',
});
