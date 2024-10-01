import { ObjectId } from 'mongoose';

export interface BoardResponse {
  _id: ObjectId | undefined;
  annotations: string[];
  visibility: string;
  user: ObjectId;
  color: string;
  keywords: string[];
}
