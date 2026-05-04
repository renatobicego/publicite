import { Document, Schema } from 'mongoose';
import { Visibility } from '../../domain/entity/visibility.enum';

const VISIBILITY_VALUES = Object.values(Visibility);

const VisibilityField = {
  type: String,
  enum: VISIBILITY_VALUES,
  default: Visibility.PUBLIC,
};

const ProfesionSchema = new Schema(
  {
    label: { type: String },
    visibility: VisibilityField,
  },
  { _id: false },
);

const CurriculumSchema = new Schema(
  {
    ref: { type: String },
    visibility: VisibilityField,
  },
  { _id: false },
);

const DescriptionSchema = new Schema(
  {
    text: { type: String },
    visibility: VisibilityField,
  },
  { _id: false },
);

const LinkItemSchema = new Schema(
  {
    url: { type: String },
    label: { type: String },
    visibility: VisibilityField,
  },
  { _id: false },
);

export const ContactSchema = new Schema({
  phone: { type: String },
  phoneVisibility: VisibilityField,
  instagram: { type: String },
  instagramVisibility: VisibilityField,
  facebook: { type: String },
  facebookVisibility: VisibilityField,
  x: { type: String },
  xVisibility: VisibilityField,
  website: { type: String },
  websiteVisibility: VisibilityField,
  profesion: { type: ProfesionSchema, default: undefined },
  curriculum: { type: CurriculumSchema, default: undefined },
  description: { type: DescriptionSchema, default: undefined },
  links: { type: [LinkItemSchema], default: undefined },
});

export interface ContactDocument extends Document {
  phone?: string;
  phoneVisibility?: string;
  instagram?: string;
  instagramVisibility?: string;
  facebook?: string;
  facebookVisibility?: string;
  x?: string;
  xVisibility?: string;
  website?: string;
  websiteVisibility?: string;
  profesion?: { label?: string; visibility?: string };
  curriculum?: { ref?: string; visibility?: string };
  description?: { text?: string; visibility?: string };
  links?: { url?: string; label?: string; visibility?: string }[];
}
