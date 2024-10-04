import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/entity/post.entity';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { ClientSession, Connection, Model, ObjectId } from 'mongoose';
import { Inject } from '@nestjs/common';

import { PostRepositoryMapperInterface } from '../../domain/repository/mapper/post.repository.mapper.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { PostLocation } from '../../domain/entity/postLocation.entity';
import { PostLocationDocument } from '../schemas/postLocation.schema';
import { PostGood } from '../../domain/entity/post-types/post.good.entity';
import {
  IPostGood,
  PostGoodModel,
} from '../schemas/post-types-schemas/post.good.schema';
import {
  IPostService,
  PostServiceModel,
} from '../schemas/post-types-schemas/post.service.schema';
import { PostService } from '../../domain/entity/post-types/post.service.entity';
import { PostPetition } from '../../domain/entity/post-types/post.petition.entity';
import {
  IPostPetition,
  PostPetitionModel,
} from '../schemas/post-types-schemas/post.petition.schema';
import { PostUpdateDto } from '../../domain/entity/dto/post.update.dto';
import { PostType } from '../../domain/entity/enum/post-type.enum';
import { PostDocument } from '../schemas/post.schema';
import {
  IUser,
  UserModel,
} from 'src/contexts/user/infrastructure/schemas/user.schema';

export class PostRepository implements PostRepositoryInterface {
  constructor(
    @InjectModel(PostGoodModel.modelName)
    private readonly postGoodDocument: Model<IPostGood>,

    @InjectModel(PostServiceModel.modelName)
    private readonly postServiceDocument: Model<IPostService>,

    @InjectModel(PostPetitionModel.modelName)
    private readonly postPetitionDocument: Model<IPostPetition>,

    @InjectModel(UserModel.modelName)
    private readonly userDocument: Model<IUser>,

    @InjectModel('PostLocation')
    private readonly locationDocument: Model<PostLocationDocument>,
    @Inject('PostRepositoryMapperInterface')
    private readonly postMapper: PostRepositoryMapperInterface,

    @InjectModel('Post')
    private readonly postDocument: Model<PostDocument>,

    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(
    post: Post,
    locationID: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<Post> {
    try {
      this.logger.log('Saving post in repository');
      const documentToSave = {
        title: post.getTitle,
        author: post.getAuthor,
        postType: post.getPostType,
        description: post.getDescription,
        visibility: post.getVisibility,
        recomendations: post.getRecomendations,
        price: post.getPrice,
        location: locationID,
        category: post.getCategory,
        comments: post.getComments,
        attachedFiles: post.getAttachedFiles,
        createAt: post.getCreateAt,
      };
      switch (post.getPostType.toLowerCase()) {
        case 'good':
          return this.saveGoodPost(documentToSave, post as PostGood, options);

        case 'service':
          return this.saveServicePost(
            documentToSave,
            post as PostService,
            options,
          );

        case 'petition':
          return this.savePetitionPost(
            documentToSave,
            post as PostPetition,
            options,
          );

        default:
          this.logger.error('Invalid post type: ' + post.getPostType);
          throw Error;
      }
    } catch (error: any) {
      this.logger.error('Error creating post REPOSITORY: ' + error);
      throw error;
    }
  }

  async deletePostById(id: string): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const postDeleted = await this.postDocument.findByIdAndDelete(id, {
          session,
        });
        if (!postDeleted) throw new Error('Post not found');

        const deletePromises = [
          /*
          - Falta reviews 
          - Falta comments
          */
          this.locationDocument.deleteOne(
            { _id: postDeleted.location },
            { session },
          ),
          this.userDocument.findOneAndUpdate(
            {
              _id: postDeleted.author,
            },
            {
              $pull: { posts: postDeleted._id },
            },
            { session },
          ),
        ];

        await Promise.all(deletePromises);
      });
      await session.commitTransaction();
    } catch (error) {
      this.logger.error('Error deleting post REPOSITORY: ' + error);
      await session.abortTransaction();
      this.logger.error('Session aborted');
      throw error;
    } finally {
      session.endSession();
    }
  }

  async saveLocation(
    location: PostLocation,
    options?: { session?: ClientSession },
  ): Promise<ObjectId> {
    try {
      this.logger.log('Saving location in repository');
      const postPostedDocument = new this.locationDocument(location);
      const documentSaved = await postPostedDocument.save(options);
      return documentSaved._id as unknown as ObjectId;
    } catch (error: any) {
      this.logger.error('Error creating location REPOSITORY: ' + error);
      throw error;
    }
  }

  async saveGoodPost(
    baseObj: any,
    post: PostGood,
    options?: { session?: ClientSession },
  ): Promise<Post> {
    try {
      const newPost = {
        ...baseObj,
        imageUrls: post.getImageUrls,
        year: post.getYear,
        brand: post.getBrand,
        modelType: post.getModel,
        reviews: post.getReviews,
        condition: post.getCondition,
      };
      const postPostedDocument = new this.postGoodDocument(newPost);
      const documentSaved = await postPostedDocument.save(options);

      const ret = this.postMapper.documentToEntityMapped(documentSaved);
      this.logger.log('Post good created successfully: ' + ret.getId);
      return ret;
    } catch (error: any) {
      this.logger.error('Error creating PostGood REPOSITORY: ' + error);
      throw error;
    }
  }
  async saveServicePost(
    baseObj: any,
    post: PostService,
    options?: { session?: ClientSession },
  ): Promise<any> {
    try {
      const newPost = {
        ...baseObj,
        frequencyPrice: post.getfrequencyPrice,
        imageUrls: post.getImageUrls,
        reviews: post.getReviews,
      };

      const postPostedDocument = new this.postServiceDocument(newPost);
      const documentSaved = await postPostedDocument.save(options);

      const ret = this.postMapper.documentToEntityMapped(documentSaved);
      this.logger.log('Post service created successfully: ' + ret.getId);
      return ret;
    } catch (error: any) {
      this.logger.error('Error creating PostService REPOSITORY: ' + error);
      throw error;
    }
  }

  async savePetitionPost(
    baseObj: any,
    post: PostPetition,
    options?: { session?: ClientSession },
  ): Promise<any> {
    try {
      const newPost = {
        ...baseObj,
        toPrice: post.getToPrice,
        frequencyPrice: post.getFrequencyPrice,
        petitionType: post.getPetitionType,
      };

      const postPostedDocument = new this.postPetitionDocument(newPost);
      const documentSaved = await postPostedDocument.save(options);

      const ret = this.postMapper.documentToEntityMapped(documentSaved);
      this.logger.log('Post service created successfully: ' + ret.getId);
      return ret;
    } catch (error: any) {
      this.logger.error('Error creating PostService REPOSITORY: ' + error);
      throw error;
    }
  }

  async updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
  ): Promise<any> {
    try {
      let postId;
      switch (postType) {
        case PostType.Good:
          this.logger.warn('Updating POST TYPE: ' + postType);
          postId = await this.postGoodDocument.findByIdAndUpdate(
            id,
            postUpdate,
          );
          return postId?._id;
        case PostType.Service:
          this.logger.warn('Updating POST TYPE: ' + postType);
          postId = await this.postServiceDocument.findByIdAndUpdate(
            id,
            postUpdate,
          );
          return postId?._id;
        case PostType.Petition:
          this.logger.warn('Updating POST TYPE: ' + postType);
          postId = await this.postPetitionDocument.findByIdAndUpdate(
            id,
            postUpdate,
          );
          return postId?._id;
        default:
          this.logger.error(
            'Invalid post type we could not update: ' + postType,
          );
          throw Error;
      }
    } catch (error: any) {
      throw error;
    }
  }
}
