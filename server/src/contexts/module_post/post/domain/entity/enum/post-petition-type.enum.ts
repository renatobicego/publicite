import { registerEnumType } from '@nestjs/graphql';

export enum PetitionType {
  Good = 'good',
  Service = 'service',
}

registerEnumType(PetitionType, {
  name: 'petitionType',
  description: 'Type of petition',
});
