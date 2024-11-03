import { ObjectId } from 'mongoose';

export interface PostRequest {
  title: string;
  author: ObjectId;
  postType: string;
  description: string;
  visibility: {
    post: string;
    socialMedia: string;
  };
  recomendations?: ObjectId[];
  price: number;
  location: {
    location: {
      type: 'Point';
      coordinates: [number];
    };
    userSetted: boolean;
    description: string;
  };
  category?: ObjectId[];
  comments?: ObjectId[];
  attachedFiles?: Array<{
    url: string;
    label: string;
  }>;
  createAt: string;
  _id?: ObjectId;
}

export interface PostGoodRequest extends PostRequest {
  imagesUrls: string[];
  year: number;
  brand: string;
  modelType: string;
  reviews: ObjectId[];
  condition: string;
}

export interface PostServiceRequest extends PostRequest {
  frequencyPrice: string;
  imagesUrls: string[];
  reviews: ObjectId[];
}

export interface PostPetitionRequest extends PostRequest {
  toPrice: string;
  frequencyPrice: string;
  petitionType: string;
}
