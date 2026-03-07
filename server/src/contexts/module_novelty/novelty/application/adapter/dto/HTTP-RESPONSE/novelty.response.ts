import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NoveltyPropertyResponse {
  @Field(() => String)
  key: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class NoveltyBlockResponse {
  @Field(() => String)
  type: string;

  @Field(() => String)
  data: string;
}

@ObjectType()
export class NoveltyResponse {
  @Field(() => String)
  _id: string;

  @Field(() => [NoveltyPropertyResponse], { nullable: false })
  properties: NoveltyPropertyResponse[];

  @Field(() => [NoveltyBlockResponse], { nullable: false })
  blocks: NoveltyBlockResponse[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  constructor(document: any) {
    this._id = document._id?.toString();
    this.properties = Array.isArray(document.properties) ? document.properties : [];
    this.blocks = Array.isArray(document.blocks) ? document.blocks : [];
    this.createdAt = document.createdAt;
    this.updatedAt = document.updatedAt;
  }
}
