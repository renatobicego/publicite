import { Visibility } from 'src/contexts/module_user/contact/domain/entity/visibility.enum';

export interface ProfesionResponse {
  label?: string;
  visibility?: Visibility;
}

export interface CurriculumResponse {
  ref?: string;
  visibility?: Visibility;
}

export interface DescriptionResponse {
  text?: string;
  visibility?: Visibility;
}

export interface LinkItemResponse {
  url?: string;
  label?: string;
  visibility?: Visibility;
}

export interface ContactRespose {
  _id?: string;
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
  profesion?: ProfesionResponse;
  curriculum?: CurriculumResponse;
  description?: DescriptionResponse;
  links?: LinkItemResponse[];
}
