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
}
