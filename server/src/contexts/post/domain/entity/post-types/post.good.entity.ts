import { ObjectId } from 'mongoose';
import { Post, Visibility } from '../post.entity';
import { PostLocation } from '../postLocation.entity';
import { PostRecomendation } from '../postRecomendation.entity';

export class PostGood extends Post {
  private imageUrls: string[];
  private year?: number;
  private brand?: string;
  private modelType?: string;
  private reviews?: ObjectId[];
  private condition: string;
  constructor(
    title: string,
    author: string,
    postType: string,
    description: string,
    visibility: Visibility,
    recomendations: PostRecomendation[],
    price: number,
    location: PostLocation,
    category: ObjectId[],
    comments: ObjectId[],
    attachedFiles: { url: string; label: string }[],
    createAt: string,
    //Good atributes
    imageUrls?: string[],
    year?: number,
    brand?: string,
    modelType?: string,
    reviews?: ObjectId[],
    condition?: string,
    _id?: ObjectId,
  ) {
    super(
      title,
      author,
      postType,
      description,
      visibility,
      recomendations,
      price,
      location,
      category,
      comments,
      attachedFiles as [],
      createAt,
      _id,
    );

    this.imageUrls = imageUrls || [];
    this.year = year;
    this.brand = brand;
    this.modelType = modelType;
    this.reviews = reviews;
    this.condition = condition || 'new';
  }

  get getImageUrls() {
    return this.imageUrls;
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
