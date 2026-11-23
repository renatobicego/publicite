import { Field, InputType } from '@nestjs/graphql';
import { GeoAreasInput } from 'src/contexts/module_shared/geo-reach/geo-reach.graphql';

@InputType()
export class UserLocation {
  @Field(() => Number)
  latitude: number;

  @Field(() => Number)
  longitude: number;

  @Field(() => GeoAreasInput, {
    nullable: true,
    description:
      'Zonas de quien mira (barrio, ciudad, provincia, país). Sin ellas no ve los anuncios ni blogs limitados a una zona.',
  })
  areas?: GeoAreasInput | null;
}
