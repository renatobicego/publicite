import { ObjectId } from 'mongoose';

export interface PostResponse {
  title: string;
  author: ObjectId;
  postType: string;
  description: string;
  visibility: string;
  recomendations: any[];
  price: number;
  location: string;
  category: any[];
  comments: any[];
  attachedFiles: { url: string; label: string }[];
  createAt: string;
  _id: ObjectId;
}

export interface PostGoodResponse extends PostResponse {
  imagesUrls: string[];
  year?: number | undefined;
  brand?: string;
  modelType?: string;
  reviews: string[];
  condition: string;
}
export interface PostServiceResponse extends PostResponse {
  frequencyPrice: string;
  imagesUrls: string[];
  reviews: string[];
}

export interface PostPetitionResponse extends PostResponse {
  toPrice: number;
  frequencyPrice: string;
  petitionType: string;
}
