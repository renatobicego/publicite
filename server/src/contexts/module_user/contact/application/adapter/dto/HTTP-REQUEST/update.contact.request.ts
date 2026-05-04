import { Field, InputType } from '@nestjs/graphql';
import { Visibility } from '../../../../domain/entity/visibility.enum';

@InputType()
export class ProfesionInput {
  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility;
}

@InputType()
export class CurriculumInput {
  @Field(() => String, { nullable: true })
  ref?: string;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility;
}

@InputType()
export class DescriptionInput {
  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility;
}

@InputType()
export class LinkItemInput {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility;
}

@InputType()
export class UpdateContactRequest {
  @Field(() => String, { nullable: true })
  phone?: string;
  @Field(() => Visibility, { nullable: true })
  phoneVisibility?: Visibility;

  @Field(() => String, { nullable: true })
  instagram?: string;
  @Field(() => Visibility, { nullable: true })
  instagramVisibility?: Visibility;

  @Field(() => String, { nullable: true })
  facebook?: string;
  @Field(() => Visibility, { nullable: true })
  facebookVisibility?: Visibility;

  @Field(() => String, { nullable: true })
  website?: string;
  @Field(() => Visibility, { nullable: true })
  websiteVisibility?: Visibility;

  @Field(() => String, { nullable: true })
  x?: string;
  @Field(() => Visibility, { nullable: true })
  xVisibility?: Visibility;

  @Field(() => ProfesionInput, { nullable: true })
  profesion?: ProfesionInput;

  @Field(() => CurriculumInput, { nullable: true })
  curriculum?: CurriculumInput;

  @Field(() => DescriptionInput, { nullable: true })
  description?: DescriptionInput;

  @Field(() => [LinkItemInput], { nullable: true })
  links?: LinkItemInput[];
}
