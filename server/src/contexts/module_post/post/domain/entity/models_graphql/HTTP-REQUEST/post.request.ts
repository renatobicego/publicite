import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { PostType } from '../../enum/post-type.enum';
import { Visibility } from '../../enum/post-visibility.enum';
import { PostBehaviourType } from '../../enum/postBehaviourType.enum';


@InputType()
class VisibilityOfPost {
  @Field(() => Visibility)
  post: Visibility;
}

@InputType()
class AttachedFilesRequest {
  @Field(() => String)
  url: string;

  @Field(() => String)
  label: string;
}
@InputType()
class LocationPost {
  @Field(() => String)
  type: 'Point';

  @Field(() => [Number])
  coordinates: [number, number];
}

@InputType()
class LocationOfPost {

  @Field(() => LocationPost)
  location: LocationPost;

  @Field(() => Boolean)
  userSetted: boolean;

  @Field(() => String)
  description: string;

  @Field(() => Number)
  ratio: number;
}

@InputType()
export class PostRequest {

  @Field(() => String)
  title: string;

  @Field(() => String)
  author: string;

  @Field(() => PostType)
  postType: PostType;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => VisibilityOfPost)
  visibility: VisibilityOfPost;


  @Field(() => Number, { nullable: true })
  price: number;

  @Field(() => LocationOfPost)
  geoLocation: LocationOfPost;

  @Field(() => [String], { nullable: true })
  category: ObjectId[];

  @Field(() => [String], { nullable: true })
  comments: ObjectId[];

  @Field(() => [AttachedFilesRequest], { nullable: true })
  attachedFiles: AttachedFilesRequest[]

  @Field(() => String)
  createAt: string;

  @Field(() => PostBehaviourType)
  postBehaviourType: PostBehaviourType;



  // attributes of good
  @Field(() => [String], { nullable: true })
  imagesUrls: string[];

  @Field(() => Number, { nullable: true })
  year: number;

  @Field(() => String, { nullable: true })
  brand: string;

  @Field(() => String, { nullable: true })
  modelType: string;

  @Field(() => String, { nullable: true })
  condition: string;


  // attributes of service
  @Field(() => String, { nullable: true })
  frequencyPrice: string;


  // attributes of petition
  @Field(() => Number, { nullable: true })
  toPrice: number;

  @Field(() => String, { nullable: true })
  petitionType: string;



}


@ObjectType()
export class PostIdResponse {
  @Field(() => String)
  _id: String
}

// export interface PostGoodRequest extends PostRequest {
// imagesUrls: string[];
// year: number;
// brand: string;
// modelType: string;
// reviews: ObjectId[];
// condition: string;
// }

// export interface PostServiceRequest extends PostRequest {
//   frequencyPrice: string;
//   imagesUrls: string[];
//   reviews: ObjectId[];
// }

// export interface PostPetitionRequest extends PostRequest {
//   toPrice: number;
//   frequencyPrice: string;
//   petitionType: string;
// }
