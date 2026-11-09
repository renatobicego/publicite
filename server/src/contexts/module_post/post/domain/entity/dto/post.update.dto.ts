import { ObjectId } from 'mongoose';

export class PostUpdateDto {
  _id?: ObjectId;
  title?: string;
  searchTitle?: string;
  description?: string;
  searchDescription?: string;
  visibility?: any;
  price?: number;
  //location?: any;
  category?: ObjectId[];
  attachedFiles?: Array<{
    url: string;
    label: string;
  }>;
  imagesUrls?: string[];
  /** Pesos de las fotos y videos (los nuevos al llegar; el service arma el total). */
  mediaSizes?: Array<{ key: string; sizeBytes: number }>;
  year?: number;
  brand?: string;
  modelType?: string;
  condition?: string;
  frequencyPrice?: string;
  toPrice?: number;
  petitionType?: string;
  endDate?: Date;
}
