import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { PostType } from "../../domain/entity/enum/post-type.enum";
import { Post } from "../../domain/entity/post.entity";
import { PostFactoryInterface } from "../../domain/post-factory/post.factory.interface";
import { PostGoodRequest, PostPetitionRequest, PostRequest, PostServiceRequest } from "../dto/HTTP-REQUEST/post.request";
import { PostLocation } from "../../domain/entity/postLocation.entity";
import { PostGood } from "../../domain/entity/post-types/post.good.entity";
import { PostService } from "../../domain/entity/post-types/post.service.entity";
import { PostPetition } from "../../domain/entity/post-types/post.petition.entity";
import { removeAccents_removeEmojisAndToLowerCase } from "../../domain/utils/normalice.data";


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
        let request;
        const visibilityNormalizated = {
            post: post.visibility.post.toLowerCase(),
            socialMedia: post.visibility.socialMedia.toLowerCase(),
        };


        const postLocation = new PostLocation(
            post.location.location.coordinates,
            post.location.userSetted,
            post.location.description
        );
        const searchTitle = removeAccents_removeEmojisAndToLowerCase(post.title)
        const searchDescription = removeAccents_removeEmojisAndToLowerCase(post.description)

        const postBase = new Post(
            post.title,
            searchTitle,
            post.author,
            postType,
            post.description ?? null,
            searchDescription,
            visibilityNormalizated,
            post.recomendations ?? [] as any,
            post.price,
            postLocation,
            post.category ?? [],
            post.comments ?? [],
            post.attachedFiles ?? [] as any,
            post.createAt,
        );


        switch (post.postType.toLowerCase()) {
            case PostType.good:
                request = post as PostGoodRequest;
                this.logger.log('We are creating a good post');
                return new PostGood(
                    postBase,
                    request.imagesUrls,
                    request.year ?? null,
                    request.brand ?? null,
                    request.modelType ?? null,
                    request.reviews ?? [],
                    request.condition ?? null,
                );

            case PostType.service:
                this.logger.log('We are creating a service post');
                request = post as PostServiceRequest;
                return new PostService(
                    postBase,
                    request.frequencyPrice ?? null,
                    request.imagesUrls ?? [],
                    request.reviews ?? [],
                );

            case PostType.petition:
                this.logger.log('We are creating a service post');

                request = post as PostPetitionRequest;
                return new PostPetition(
                    postBase,
                    request.toPrice ?? null,
                    request.frequencyPrice ?? null,
                    request.petitionType,
                );
            default:
                this.logger.log('Error in factory method');
                throw new Error('Error in factory method, we cant recognize the post type');

        }

    }




} 