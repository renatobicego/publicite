import { ObjectType, Field, Float } from '@nestjs/graphql';
import { GeoReachScope, GeoZoneLevel } from 'src/contexts/module_shared/geo-reach/geo-reach.enums';
import { GeoAreasResponse } from 'src/contexts/module_shared/geo-reach/geo-reach.graphql';

@ObjectType()
export class location {
  @Field(() => String)
  type: 'Point';
  @Field(() => [Float])
  coordinates: [number, number];
}

@ObjectType()
export class PostLocation_Grapql {
  @Field(() => location, { nullable: true })
  location: location;
  @Field(() => Boolean, { nullable: true })
  userSetted: boolean;
  @Field(() => String, { nullable: true })
  description: string;
  @Field(() => Float, { nullable: true, description: 'Radio en metros' })
  ratio?: number;
  @Field(() => GeoReachScope, { nullable: true, description: 'Sin valor = radius' })
  scope?: GeoReachScope | null;
  @Field(() => GeoZoneLevel, { nullable: true })
  zoneLevel?: GeoZoneLevel | null;
  @Field(() => GeoAreasResponse, { nullable: true })
  areas?: GeoAreasResponse | null;
}
