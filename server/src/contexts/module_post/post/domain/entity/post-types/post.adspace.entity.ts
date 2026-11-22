import { ObjectId } from 'mongoose';
import { Post } from '../post.entity';
import { AdSpaceData } from '../../../application/functions/adSpace';

/**
 * Espacio publicitario (radio, TV, vía pública…). Soonpublicité sólo genera
 * el contacto: el precio es de referencia, como en los anuncios.
 */
export class PostAdSpace extends Post {
  private frequencyPrice: string;
  private imagesUrls: string[];
  private reviews: ObjectId[];
  private adSpace: AdSpaceData;

  constructor(
    post: Post,
    adSpace: AdSpaceData,
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
    this.adSpace = adSpace;
    this.frequencyPrice = frequencyPrice ?? '';
    this.imagesUrls = imagesUrls || [];
    this.reviews = reviews ?? [];
  }

  get getAdSpace() {
    return this.adSpace;
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
