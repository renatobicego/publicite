import { ObjectId } from 'mongoose';
import { Field, ObjectType, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class PostLocation_Grapql_Model {
  @Field(() => String)
  type: 'Point'; // Este valor está fijo en 'Point'

  @Field(() => [Number])
  coordinates: [number, number]; // Arreglo de coordenadas

  @Field()
  userSetted: boolean; // Campo booleano

  @Field()
  description: string; // Campo de descripción
}

@ObjectType()
class Visibility {
  @Field(() => String, { nullable: true })
  post: string;
  @Field(() => String, { nullable: true })
  socialMedia: string;
}

@ObjectType()
export class AttachedFile {
  @Field(() => String)
  url: string;

  @Field(() => String)
  label: string;
}

@ObjectType()
export class Post_Full_Graphql_Model {
  @Field(() => ID, { nullable: true }) // _id puede ser nulo
  _id?: ObjectId;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  postType: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Visibility, { nullable: true })
  visibility: Visibility;
  //ver que necesitamos de esto
  //recomendations: PostRecomendation[];
  @Field(() => Float, { nullable: true })
  price: number;

  @Field(() => PostLocation_Grapql_Model, { nullable: true })
  location: PostLocation_Grapql_Model;

  @Field(() => [String], { nullable: true })
  category: ObjectId[];

  @Field(() => [String], { nullable: true })
  comments: ObjectId[];

  @Field(() => [AttachedFile], { nullable: true })
  attachedFiles?: AttachedFile[];

  @Field(() => String, { nullable: true })
  createAt: string;

  @Field(() => Float, { nullable: true })
  toPrice: number;

  @Field(() => String, { nullable: true })
  frequencyPrice: string;

  @Field(() => String, { nullable: true })
  petitionType: string;
}
