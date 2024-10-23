import { ObjectId } from 'mongoose';

export interface BoardRequest {
  annotations: string[];
  visibility: string;
  user: ObjectId;
  color: string;
  keywords: string[];
  searchTerm: string;
}

