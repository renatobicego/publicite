import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

@InputType({ description: 'Reseña y calificación de una producción (REV-01)' })
export class ProductionReviewInput {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => Int, { description: 'Calificación de 1 a 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'La reseña no puede estar vacía' })
  @MaxLength(2000)
  review: string;
}

@InputType()
export class ProductionReviewUpdateInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La reseña no puede estar vacía' })
  @MaxLength(2000)
  review?: string;
}

@InputType({ description: 'Comentario en un blog o en un archivo (REV-01)' })
export class ProductionCommentInput {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => ID, {
    nullable: true,
    description: 'Archivo o artículo comentado; vacío = el blog',
  })
  @IsOptional()
  @IsMongoId()
  itemId?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(2000)
  comment: string;
}
