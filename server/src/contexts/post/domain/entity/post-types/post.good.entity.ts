import { ObjectId } from 'mongoose';
import { Post } from '../post.entity';

export class PostGood extends Post {
  private imagesUrls: string[];
  private year?: number;
  private brand?: string;
  private modelType?: string;
  private reviews?: ObjectId[];
  private condition: string;
  constructor(
    post: Post,
    //Good atributes
    imagesUrls?: string[],
    year?: number,
    brand?: string,
    modelType?: string,
    reviews?: ObjectId[],
    condition?: string,
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

    this.imagesUrls = imagesUrls || [];
    this.year = year;
    this.brand = brand;
    this.modelType = modelType;
    this.reviews = reviews;
    this.condition = condition || 'new';
  }

  get getImageUrls() {
    return this.imagesUrls;
  }

  get getYear() {
    return this.year;
  }

  get getBrand() {
    return this.brand;
  }

  get getModel() {
    return this.modelType;
  }

  get getReviews() {
    return this.reviews;
  }

  get getCondition() {
    return this.condition;
  }
}
