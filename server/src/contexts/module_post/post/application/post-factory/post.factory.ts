import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PostType } from '../../domain/entity/enum/post-type.enum';
import { Post } from '../../domain/entity/post.entity';
import { PostFactoryInterface } from '../../domain/post-factory/post.factory.interface';
import { PostGood } from '../../domain/entity/post-types/post.good.entity';
import { PostService } from '../../domain/entity/post-types/post.service.entity';
import { PostPetition } from '../../domain/entity/post-types/post.petition.entity';
import { PostAdSpace } from '../../domain/entity/post-types/post.adspace.entity';
import { normalizeAdSpace } from '../functions/adSpace';
import { PostBehaviourType } from '../../domain/entity/enum/postBehaviourType.enum';
import { Visibility } from '../../domain/entity/enum/post-visibility.enum';
import { removeAccents_removeEmojisAndToLowerCase } from '../../domain/utils/normalice.data';
import { PostRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { Schema } from 'mongoose';
import { FrequencyPrice } from '../../domain/entity/enum/post-service-freq-type.enum';
import { normalizeGeoReach } from 'src/contexts/module_shared/geo-reach/geo-reach';

export class PostFactory implements PostFactoryInterface {
  private static instance: PostFactory | null = null;
  private readonly logger: MyLoggerService;

  private constructor(logger: MyLoggerService) {
    this.logger = logger;
  }

  public static getInstance(logger: MyLoggerService): PostFactory {
    if (!PostFactory.instance) {
      PostFactory.instance = new PostFactory(logger);
    }
    return PostFactory.instance;
  }

  createPost(postType: PostType, post: PostRequest): Post {
    const isAdSpace = post.postType?.toLowerCase() === PostType.adspace;
    if (isAdSpace) {
      // Los espacios publicitarios son siempre geolocalizados y públicos.
      post.postBehaviourType = PostBehaviourType.libre;
      post.visibility = { ...post.visibility, post: Visibility.public };
    }
    const visibilityNormalizated = {
      post: post.visibility.post.toLowerCase(),
      socialMedia: post.visibility.socialMedia.toLowerCase(),
    };
    const postAttachedEmpty = {
      url: '',
      label: '',
    };
    const emptyArray: Schema.Types.ObjectId[] = [];
    const postReactions = emptyArray;
    const postComments = emptyArray;
    const postReviews = emptyArray;

    const searchTitle = removeAccents_removeEmojisAndToLowerCase(post.title);
    const searchDescription = removeAccents_removeEmojisAndToLowerCase(
      post.description,
    );
    const isActive = true;
    post.geoLocation.location.type = 'Point';
    // Radio, zona o mundo: valida que el punto tenga la zona elegida.
    const { scope, zoneLevel, areas } = normalizeGeoReach(post.geoLocation);
    const geoLocation = {
      location: post.geoLocation.location,
      userSetted: post.geoLocation.userSetted,
      description: post.geoLocation.description,
      ratio: post.geoLocation.ratio,
      scope,
      zoneLevel,
      areas,
    };

    const postBase = new Post(
      post.title,
      searchTitle,
      post.author,
      postType,
      post.description ?? 'El vendedor no ha proporcionado una descripción',
      searchDescription,
      visibilityNormalizated,
      [] as any, // recomendations
      post.price ?? 0,
      geoLocation,
      post.category ?? [],
      postComments,
      post.attachedFiles ?? ([postAttachedEmpty] as any),
      post.createAt,
      postReactions,
      post.postBehaviourType,
      isActive,
      post.endDate ?? null,
    );

    switch (post.postType.toLowerCase()) {
      case PostType.good:
        this.logger.log('We are creating a good post');
        return new PostGood(
          postBase,
          post.imagesUrls,
          post.year ?? null,
          post.brand ?? null,
          post.modelType ?? null,
          postReviews, // reviews
          post.condition ?? null,
        );

      case PostType.service:
        this.logger.log('We are creating a service post');

        return new PostService(
          postBase,
          post.frequencyPrice ?? FrequencyPrice.undefined,
          post.imagesUrls ?? [],
          postReviews, // reviews
        );

      case PostType.petition:
        this.logger.log('We are creating a service post');
        return new PostPetition(
          postBase,
          post.toPrice ?? null,
          post.frequencyPrice ?? FrequencyPrice.undefined,
          post.petitionType,
        );
      case PostType.adspace:
        this.logger.log('We are creating an ad space post');
        return new PostAdSpace(
          postBase,
          normalizeAdSpace(post.adSpace),
          post.frequencyPrice ?? FrequencyPrice.undefined,
          post.imagesUrls ?? [],
          postReviews,
        );
      default:
        this.logger.log('Error in factory method');
        throw new Error(
          'Error in factory method, we cant recognize the post type',
        );
    }
  }
}
