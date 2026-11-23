import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Zonas de un punto tal como las devuelve el geocodificador de Google en el
 * cliente: nombre (para mostrar, en el idioma del navegador) y `place_id` de
 * cada nivel (para comparar, no depende del idioma). El server arma las claves con `buildGeoAreas`, así
 * la normalización es una sola para el anuncio y para quien mira.
 */
@InputType()
export class GeoAreasInput {
  @Field(() => String, { nullable: true, description: 'Código ISO del país (AR, UY…)' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string | null;

  @Field(() => String, { nullable: true, description: 'Provincia / estado / departamento (UY)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  province?: string | null;

  @Field(() => String, { nullable: true, description: 'place_id de Google de ese nivel (no depende del idioma)' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  provinceId?: string | null;

  @Field(() => String, { nullable: true, description: 'Ciudad, localidad o partido' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string | null;

  @Field(() => String, { nullable: true, description: 'place_id de Google de ese nivel (no depende del idioma)' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  cityId?: string | null;

  @Field(() => String, { nullable: true, description: 'Barrio' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  neighborhood?: string | null;

  @Field(() => String, { nullable: true, description: 'place_id de Google de ese nivel (no depende del idioma)' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  neighborhoodId?: string | null;
}

@ObjectType()
export class GeoAreaResponse {
  @Field(() => String)
  key: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class GeoAreasResponse {
  @Field(() => GeoAreaResponse, { nullable: true })
  continent?: GeoAreaResponse | null;

  @Field(() => GeoAreaResponse, { nullable: true })
  country?: GeoAreaResponse | null;

  @Field(() => GeoAreaResponse, { nullable: true })
  province?: GeoAreaResponse | null;

  @Field(() => GeoAreaResponse, { nullable: true })
  city?: GeoAreaResponse | null;

  @Field(() => GeoAreaResponse, { nullable: true })
  neighborhood?: GeoAreaResponse | null;
}
