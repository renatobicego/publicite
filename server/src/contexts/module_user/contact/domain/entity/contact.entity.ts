import { ObjectId } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class Contact {
  @Field(() => ID, { nullable: true })
  private _id?: ObjectId;
  @Field(() => String, { nullable: true })
  private phone: string;
  @Field(() => String, { nullable: true })
  private instagram: string;
  @Field(() => String, { nullable: true })
  private facebook: string;
  @Field(() => String, { nullable: true })
  private x: string;
  @Field(() => String, { nullable: true })
  private website: string;

  constructor(
    phone: string,
    instagram: string,
    facebook: string,
    x: string,
    website: string,
  ) {
    this.phone = phone;
    this.instagram = instagram;
    this.facebook = facebook;
    this.x = x;
    this.website = website;
  }

  public getPhone() {
    return this.phone;
  }
  public getInstagram() {
    return this.instagram;
  }
  public getFacebook() {
    return this.facebook;
  }
  public getX() {
    return this.x;
  }
  public getWebsite() {
    return this.website;
  }
}
