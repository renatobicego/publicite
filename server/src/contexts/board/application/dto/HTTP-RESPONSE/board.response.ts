import { ObjectId } from 'mongoose';

export interface BoardResponse {
  _id: ObjectId | string;
  annotations: string[];
  visibility: string;
  user: ObjectId;
  color: string;
}
