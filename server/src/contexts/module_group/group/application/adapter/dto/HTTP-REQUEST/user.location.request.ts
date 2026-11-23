import { Field, InputType } from '@nestjs/graphql';
import { GeoAreasInput } from 'src/contexts/module_shared/geo-reach/geo-reach.graphql';

@InputType()
export class UserLocation_group {
  @Field(() => Number)
  latitude: number;

  @Field(() => Number)
  longitude: number;

  @Field(() => GeoAreasInput, { nullable: true, description: 'Zonas de quien mira (ver UserLocation.areas)' })
  areas?: GeoAreasInput | null;
}
