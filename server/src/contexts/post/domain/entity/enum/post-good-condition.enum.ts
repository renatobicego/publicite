import { registerEnumType } from '@nestjs/graphql';

export enum GoodCondition {
  New = 'new',
  Used = 'used',
  Broke = 'broke',
}

registerEnumType(GoodCondition, {
  name: 'GoodCondition',
  description: 'Condition of the good',
});
