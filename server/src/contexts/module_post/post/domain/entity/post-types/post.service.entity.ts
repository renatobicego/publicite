import { ObjectId } from 'mongoose';
import { Post } from '../post.entity';

export class PostService extends Post {
  private frequencyPrice: string;
  private imagesUrls: string[];
  private reviews: ObjectId[];

  constructor(
    post: Post,
    //Service atributes
    frequencyPrice?: string,
    imagesUrls?: string[],
    reviews?: ObjectId[],
  ) {
    super(
      post.getTitle,
      post.getSearchTitle,
      post.getAuthor,
      post.getPostType,
      post.getDescription,
      post.getSearchDescription,
      post.getVisibility,
      post.getRecomendations,
      post.getPrice,
      post.getGeoLocation,
      post.getCategory,
      post.getComments,
      post.getAttachedFiles as any,
      post.getCreateAt,
      post.getReactions,
      post.getPostBehaviourType,
      post.getIsActive,
      post.getEndDate,
      post.getId,
    );
    this.frequencyPrice = frequencyPrice ?? '';
    this.imagesUrls = imagesUrls || [];
    this.reviews = reviews ?? [];
  }

  get getfrequencyPrice() {
    return this.frequencyPrice;
  }

  get getImageUrls() {
    return this.imagesUrls;
  }

  get getReviews() {
    return this.reviews;
  }
}
