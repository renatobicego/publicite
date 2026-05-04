import { ObjectId } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Visibility } from './visibility.enum';

@ObjectType()
export class ProfesionField {
  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility;
}

@ObjectType()
export class CurriculumField {
  @Field(() => String, { nullable: true })
  ref?: string;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility;
}

@ObjectType()
export class DescriptionField {
  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility;
}

@ObjectType()
export class LinkItem {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility;
}

export interface ContactProps {
  phone?: string;
  phoneVisibility?: Visibility;
  instagram?: string;
  instagramVisibility?: Visibility;
  facebook?: string;
  facebookVisibility?: Visibility;
  x?: string;
  xVisibility?: Visibility;
  website?: string;
  websiteVisibility?: Visibility;
  profesion?: ProfesionField;
  curriculum?: CurriculumField;
  links?: LinkItem[];
  description?: DescriptionField;
}

@ObjectType()
export class Contact {
  @Field(() => ID, { nullable: true })
  private _id?: ObjectId;

  @Field(() => String, { nullable: true })
  private phone?: string;
  @Field(() => Visibility, { nullable: true })
  private phoneVisibility?: Visibility;

  @Field(() => String, { nullable: true })
  private instagram?: string;
  @Field(() => Visibility, { nullable: true })
  private instagramVisibility?: Visibility;

  @Field(() => String, { nullable: true })
  private facebook?: string;
  @Field(() => Visibility, { nullable: true })
  private facebookVisibility?: Visibility;

  @Field(() => String, { nullable: true })
  private x?: string;
  @Field(() => Visibility, { nullable: true })
  private xVisibility?: Visibility;

  @Field(() => String, { nullable: true })
  private website?: string;
  @Field(() => Visibility, { nullable: true })
  private websiteVisibility?: Visibility;

  @Field(() => ProfesionField, { nullable: true })
  private profesion?: ProfesionField;

  @Field(() => CurriculumField, { nullable: true })
  private curriculum?: CurriculumField;

  @Field(() => [LinkItem], { nullable: true })
  private links?: LinkItem[];

  @Field(() => DescriptionField, { nullable: true })
  private description?: DescriptionField;

  constructor(props: ContactProps) {
    this.phone = props.phone;
    this.phoneVisibility = props.phoneVisibility;
    this.instagram = props.instagram;
    this.instagramVisibility = props.instagramVisibility;
    this.facebook = props.facebook;
    this.facebookVisibility = props.facebookVisibility;
    this.x = props.x;
    this.xVisibility = props.xVisibility;
    this.website = props.website;
    this.websiteVisibility = props.websiteVisibility;
    this.profesion = props.profesion;
    this.curriculum = props.curriculum;
    this.links = props.links;
    this.description = props.description;
  }

  public getPhone() {
    return this.phone;
  }
  public getPhoneVisibility() {
    return this.phoneVisibility;
  }
  public getInstagram() {
    return this.instagram;
  }
  public getInstagramVisibility() {
    return this.instagramVisibility;
  }
  public getFacebook() {
    return this.facebook;
  }
  public getFacebookVisibility() {
    return this.facebookVisibility;
  }
  public getX() {
    return this.x;
  }
  public getXVisibility() {
    return this.xVisibility;
  }
  public getWebsite() {
    return this.website;
  }
  public getWebsiteVisibility() {
    return this.websiteVisibility;
  }
  public getProfesion() {
    return this.profesion;
  }
  public getCurriculum() {
    return this.curriculum;
  }
  public getLinks() {
    return this.links;
  }
  public getDescription() {
    return this.description;
  }
}
