import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/entity/post.entity';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { ClientSession, Model, ObjectId } from 'mongoose';

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

export class PostRepository implements PostRepositoryInterface {
  constructor(
    @InjectModel(PostGoodModel.modelName)
    private readonly postGoodDocument: Model<IPostGood>,
    @InjectModel(PostServiceModel.modelName)
    private readonly postServiceDocument: Model<IPostService>,
    @InjectModel('PostLocation')
    private readonly locationDocument: Model<PostLocationDocument>,
    @Inject('PostRepositoryMapperInterface')
    private readonly postMapper: PostRepositoryMapperInterface,
    private readonly logger: MyLoggerService,
  ) {}
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
          throw Error;

        default:
          this.logger.error('Invalid post type: ' + post.getPostType);
          throw Error;
      }
    } catch (error: any) {
      this.logger.error('Error creating post REPOSITORY: ' + error);
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
}
