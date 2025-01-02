import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { PostType } from "../../domain/entity/enum/post-type.enum";
import { Post } from "../../domain/entity/post.entity";
import { PostFactoryInterface } from "../../domain/post-factory/post.factory.interface";
import { PostGood } from "../../domain/entity/post-types/post.good.entity";
import { PostService } from "../../domain/entity/post-types/post.service.entity";
import { PostPetition } from "../../domain/entity/post-types/post.petition.entity";
import { removeAccents_removeEmojisAndToLowerCase } from "../../domain/utils/normalice.data";
import { PostRequest } from "../../domain/entity/models_graphql/HTTP-REQUEST/post.request";
import { Schema } from "mongoose";




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
        const visibilityNormalizated = {
            post: post.visibility.post.toLowerCase(),
            socialMedia: post.visibility.socialMedia.toLowerCase(),
        };
        const postAttachedEmpty = {
            url: '',
            label: '',
        }
        const postReactions: Schema.Types.ObjectId[] = []

        const searchTitle = removeAccents_removeEmojisAndToLowerCase(post.title)
        const searchDescription = removeAccents_removeEmojisAndToLowerCase(post.description)

        post.geoLocation.location.type = 'Point';
        const postBase = new Post(
            post.title,
            searchTitle,
            post.author,
            postType,
            post.description ?? null,
            searchDescription,
            visibilityNormalizated,
            [] as any, // recomendations
            post.price,
            post.geoLocation,
            post.category ?? [],
            post.comments ?? [],
            post.attachedFiles ?? [postAttachedEmpty] as any,
            post.createAt,
            postReactions,
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
                    [], // reviews
                    post.condition ?? null,
                );

            case PostType.service:
                this.logger.log('We are creating a service post');

                return new PostService(
                    postBase,
                    post.frequencyPrice ?? null,
                    post.imagesUrls ?? [],
                    [], // reviews
                );

            case PostType.petition:
                this.logger.log('We are creating a service post');
                return new PostPetition(
                    postBase,
                    post.toPrice ?? null,
                    post.frequencyPrice ?? null,
                    post.petitionType,
                );
            default:
                this.logger.log('Error in factory method');
                throw new Error('Error in factory method, we cant recognize the post type');

        }

    }




} 