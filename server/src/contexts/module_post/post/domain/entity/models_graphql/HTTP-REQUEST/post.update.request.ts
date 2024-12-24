import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { FrequencyPrice } from 'src/contexts/module_post/post/domain/entity/enum/post-service-freq-type.enum';
import { PostType } from 'src/contexts/module_post/post/domain/entity/enum/post-type.enum';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

@InputType()
export class VisibilityEnum {
  @Field(() => Visibility)
  post: Visibility;

  @Field(() => Visibility)
  socialMedia: Visibility;
}

@InputType()
export class AttachedFiles {
  @Field(() => String)
  url: string;

  @Field(() => String)
  label: string;
}

@InputType()
export class PostUpdateRequest {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => VisibilityEnum, { nullable: true })
  visibility?: VisibilityEnum;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => PostType)
  postType: PostType;

  @Field(() => [String], { nullable: true })
  category?: ObjectId[];

  @Field(() => [AttachedFiles], { nullable: true })
  attachedFiles?: AttachedFiles[];

  //POST GOOD Y SERVICE
  @Field(() => [String], { nullable: true })
  imagesUrls?: string[];

  //POST GOOD
  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => String, { nullable: true })
  brand?: string;

  @Field(() => String, { nullable: true })
  modelType?: string;

  @Field(() => String, { nullable: true })
  condition?: string;

  //POST Petition
  @Field(() => Float, { nullable: true })
  toPrice?: number;

  @Field(() => FrequencyPrice, { nullable: true })
  frequencyPrice?: FrequencyPrice;

  @Field(() => String, { nullable: true })
  petitionType?: string;
}

