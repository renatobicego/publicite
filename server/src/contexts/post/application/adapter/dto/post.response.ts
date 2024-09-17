export interface PostResponse {
  _id: string;
  title: string;
  author: string;
  postType: string;
  description: string;
  visibility: string;
  recomendations: string[];
  price: number;
  location: string;
  category: string[];
  comments: string[];
  attachedFiles: string[];
  createAt: string;
}
