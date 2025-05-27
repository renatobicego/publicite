import { registerEnumType } from '@nestjs/graphql';

export enum FrequencyPrice {
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
  undefined = 'undefined',
}

registerEnumType(FrequencyPrice, {
  name: 'FrequencyPrice',
  description: 'Frecuencia ',
});
