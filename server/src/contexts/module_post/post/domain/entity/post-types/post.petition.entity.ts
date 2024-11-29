import { Post } from '../post.entity';

export class PostPetition extends Post {
  private toPrice: number;

  private frequencyPrice: string;

  private petitionType: string;

  constructor(
    post: Post,
    //Good atributes
    toPrice: number,
    frequencyPrice: string,
    petitionType: string,
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
      post.getLocation,
      post.getCategory,
      post.getComments,
      post.getAttachedFiles as any,
      post.getCreateAt,
      post.getId,
    );
    this.toPrice = toPrice;
    this.frequencyPrice = frequencyPrice;
    this.petitionType = petitionType;
  }

  get getToPrice() {
    return this.toPrice;
  }

  get getFrequencyPrice() {
    return this.frequencyPrice;
  }

  get getPetitionType() {
    return this.petitionType;
  }
}
