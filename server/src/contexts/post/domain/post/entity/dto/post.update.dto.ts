import { ObjectId } from 'mongoose';

export class PostUpdateDto {
  _id?: ObjectId;
  title?: string;
  description?: string;
  visibility?: any;
  price?: number;
  //location?: any;
  category?: ObjectId[];
  attachedFiles?: Array<{
    url: string;
    label: string;
  }>;
  imagesUrls?: string[];
  year?: number;
  brand?: string;
  modelType?: string;
  condition?: string;
  frequencyPrice?: string;
  toPrice?: number;
  petitionType?: string;
}
