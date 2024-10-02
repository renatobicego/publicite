import { registerEnumType } from '@nestjs/graphql';

export enum FrequencyPrice {
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

registerEnumType(FrequencyPrice, {
  name: 'FrequencyPrice',
  description: 'Frecuencia ',
});
