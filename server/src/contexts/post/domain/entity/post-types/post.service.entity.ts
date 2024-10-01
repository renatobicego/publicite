import { ObjectId } from 'mongoose';
import { Post } from '../post.entity';

export class PostService extends Post {
  private frequencyPrice: string;
  private imageUrls: string[];
  private reviews: ObjectId[];

  constructor(
    post: Post,
    //Service atributes
    frequencyPrice?: string,
    imageUrls?: string[],
    reviews?: ObjectId[],
  ) {
    super(
      post.getTitle,
      post.getAuthor,
      post.getPostType,
      post.getDescription,
      post.getVisibility,
      post.getRecomendations,
      post.getPrice,
      post.getLocation,
      post.getCategory,
      post.getComments,
      post.getAttachedFiles as any,
      post.getCreateAt,
      post.getId,
    );
    this.frequencyPrice = frequencyPrice ?? '';
    this.imageUrls = imageUrls || [];
    this.reviews = reviews ?? [];
  }

  get getfrequencyPrice() {
    return this.frequencyPrice;
  }

  get getImageUrls() {
    return this.imageUrls;
  }

  get getReviews() {
    return this.reviews;
  }
}