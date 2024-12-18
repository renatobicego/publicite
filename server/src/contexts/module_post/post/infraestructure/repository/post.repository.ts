import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, ObjectId } from 'mongoose';
import { Inject } from '@nestjs/common';

import { Post } from '../../domain/entity/post.entity';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { PostRepositoryMapperInterface } from '../../domain/repository/mapper/post.repository.mapper.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PostLocation } from '../../domain/entity/postLocation.entity';
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
import {
  UserModel,
  IUser,
} from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { PostDocument } from '../schemas/post.schema';
import { PostLocationDocument } from '../schemas/postLocation.schema';
import { checkStopWordsAndReturnSearchQuery, SearchType } from 'src/contexts/module_shared/utils/functions/checkStopWordsAndReturnSearchQuery';
import { errorMonitor } from 'events';

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
  ) { }

  async create(
    post: Post,
    locationID: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<Post> {
    try {
      this.logger.log('Saving post in repository');
      const documentToSave = {
        title: post.getTitle,
        searchTitle: post.getSearchTitle,
        author: post.getAuthor,
        postType: post.getPostType,
        description: post.getDescription,
        searchDescription: post.getSearchDescription,
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

  async findPostsByAuthorId(id: string): Promise<any> {
    try {
      this.logger.log('Finding posts by author id in repository');
      const posts = await this.postDocument.find({ author: id })
        .select(
          '-searchTitle -searchDescription'
        )
        .lean();
      return posts;
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred finding posts by author id: ' + id,
      );
      throw error;
    }
  }
  async findPostById(id: string): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      this.logger.log('Finding post by id in repository');

      const post = await this.postDocument
        .findById(id)
        .session(session)
        .select(
          '-searchTitle -searchDescription'
        )
        .populate({
          path: 'location',
          model: 'PostLocation',
          select: 'location description userSetted coordinates',
        })
        .populate({
          path: 'category',
          model: 'PostCategory',
        })
        .populate({
          path: 'author',
          model: 'User',
          select: '_id profilePhotoUrl username lastName name contact',
          populate: {
            path: 'contact',
            model: 'Contact',
          },
        })
        .lean();

      await session.commitTransaction();
      session.endSession();

      return post;
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      this.logger.error('An error occurred finding post by id: ' + id);
      throw error;
    }
  }
  async findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    searchTerm?: string,
  ): Promise<any> {
    try {
      this.logger.log('Finding posts By postType: ' + postType);
      const today = new Date();


      if (searchTerm) {
        const textSearchQuery = checkStopWordsAndReturnSearchQuery(searchTerm, SearchType.post);

        if (!textSearchQuery) {
          return {
            posts: [],
            hasMore: false,
          }
        };


        this.logger.log('Buscando posts con términos de búsqueda');
        const posts = await this.postDocument
          .find({
            postType: postType,
            endDate: { $gte: today },
            $or: [
              { searchTitle: { $regex: textSearchQuery } },
              { searchDescription: { $regex: textSearchQuery } },
            ]
          })
          .limit(limit + 1)
          .skip((page - 1) * limit)
          .populate({
            path: 'location',
            model: 'PostLocation',
            select: 'location description userSetted coordinates',
          })
          .populate({
            path: 'category',
            model: 'PostCategory',
          })
          .populate({
            path: 'author',
            model: 'User',
            select: '_id profilePhotoUrl username lastName name contact',
            populate: {
              path: 'contact',
              model: 'Contact',
            },
          })
          .lean();


        const hasMore = posts.length > limit;
        const postResponse = posts.slice(0, limit);

        return {
          posts: postResponse,
          hasMore: hasMore,
        };
      }
      this.logger.log('Buscando posts sin términos de búsqueda');
      const posts = await this.postDocument
        .find({
          postType: postType,
          endDate: { $gte: today },
        })
        .limit(limit + 1)
        .skip((page - 1) * limit)
        .populate({
          path: 'location',
          model: 'PostLocation',
          select: 'location description userSetted coordinates',
        })
        .populate({
          path: 'category',
          model: 'PostCategory',
        })
        .populate({
          path: 'author',
          model: 'User',
          select: '_id profilePhotoUrl username lastName name contact',
          populate: {
            path: 'contact',
            model: 'Contact',
          },
        })
        .lean();

      const hasMore = posts.length > limit;
      const postResponse = posts.slice(0, limit);

      return {
        posts: postResponse,
        hasMore: hasMore,
      };
    } catch (error: any) {
      this.logger.error(
        'An error occurred finding all post by postType: ' + postType,
      );
      throw error;
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
        imagesUrls: post.getImageUrls,
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
        imagesUrls: post.getImageUrls,
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
        case PostType.good:
          this.logger.warn('Updating POST TYPE: ' + postType);
          postId = await this.postGoodDocument.findByIdAndUpdate(
            id,
            postUpdate,
          );
          return postId?._id;
        case PostType.service:
          this.logger.warn('Updating POST TYPE: ' + postType);
          postId = await this.postServiceDocument.findByIdAndUpdate(
            id,
            postUpdate,
          );
          return postId?._id;
        case PostType.petition:
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

  async updateEndDateFromPostById(postId: string, userRequestId: string): Promise<any> {
    try {
      await this.postDocument.updateOne(
        { _id: postId, author: userRequestId },
        [
          {
            $set: {
              endDate: { $add: ["$endDate", 14 * 24 * 60 * 60 * 1000] } //Actualiza 14 dias
            }
          }
        ]
      );


      this.logger.log('Updating end date from post with id: ' + postId + ' successfully updated');
      return 'End Date from post with id: ' + postId + ' successfully updated'
    } catch (error: any) {
      throw error;
    }
  }


}
