import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';


import { Post } from '../../domain/entity/post.entity';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
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
import { checkStopWordsAndReturnSearchQuery, SearchType } from 'src/contexts/module_shared/utils/functions/checkStopWordsAndReturnSearchQuery';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';
import { PostReactionDocument } from '../schemas/post.reaction.schema';
import { error } from 'console';
import { cond } from 'lodash';




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

    @InjectModel('PostReaction')
    private readonly postReactionDocument: Model<PostReactionDocument>,

    @InjectModel('Post')
    private readonly postDocument: Model<PostDocument>,

    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
  ) { }





  async create(
    post: Post,
    options?: { session?: ClientSession },
  ): Promise<String> {
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
        geoLocation: post.getGeoLocation,
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
        }).select('author');
        if (!postDeleted) throw new Error('Post not found');

        const deletePromises = [
          /*
          - Falta reviews 
          - Falta comments
          */
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

  async findMatchPost(postType: string, searchTerm: string): Promise<any> {
    try {
      return await this.postDocument.findOne({
        postType,
        $or: [
          { searchTitle: { $regex: searchTerm } },
          { searchDescription: { $regex: searchTerm } },
        ],
      })
    } catch (error: any) {
      throw error;
    }
  }


  async findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Finding posts by postType: ${postType}`);
      const today = new Date();

      // Prepara el stage de filtrado
      const matchStage: any = {
        postType,
        "visibility.post": "public",
        endDate: { $gte: today },
      };


      // Si se especifica un término de búsqueda, lo procesamos
      if (searchTerm) {
        const textSearchQuery = checkStopWordsAndReturnSearchQuery(searchTerm, SearchType.post);
        if (!textSearchQuery) {
          this.logger.log('No valid search terms provided. Returning empty result.');
          return { posts: [], hasMore: false };
        }

        matchStage.$or = [
          { searchTitle: { $regex: textSearchQuery, $options: 'i' } },
          { searchDescription: { $regex: textSearchQuery, $options: 'i' } },
        ];
      }

      // Agregación optimizada
      const posts = await this.postDocument.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLocation.longitude, userLocation.latitude],
            },
            distanceField: 'distance',
            spherical: true,
            query: matchStage,
          },
        },
        {
          $match: {
            $expr: { $lte: ['$distance', '$geoLocation.ratio'] },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              { $project: { _id: 1, profilePhotoUrl: 1, username: 1, lastName: 1, name: 1, contact: 1 } },
            ], // Solo traemos los campos necesarios
          },
        },
        { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'contacts',
            localField: 'author.contact',
            foreignField: '_id',
            as: 'author.contact',
            pipeline: [
              { $project: { _id: 1, facebook: 1, phone: 1, instagram: 1, website: 1, x: 1 } },
            ], // Solo traemos los campos necesarios
          },
        },
        { $unwind: { path: '$author.contact', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'postcategories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
            pipeline: [
              { $project: { _id: 1, label: 1 } },
            ], // Solo traemos los campos necesarios
          },
        },
        {
          $addFields: {
            author: {
              _id: '$author._id',
              profilePhotoUrl: '$author.profilePhotoUrl',
              username: '$author.username',
              lastName: '$author.lastName',
              name: '$author.name',
              contact: '$author.contact',
            },
            categories: {
              $map: {
                input: '$category',
                as: 'category',
                in: {
                  _id: '$$category._id',
                  label: '$$category.label',
                },
              },
            },
          },
        },
        // Paginación optimizada
        { $skip: (page - 1) * limit },
        { $limit: limit + 1 },
      ]);

      if (!posts) { return { posts: [], hasMore: false } }

      // Determinamos si hay más posts basados en el límite
      const hasMore = posts.length > limit;
      const postResponse = posts.slice(0, limit); // Solo devolvemos hasta el límite

      return {
        posts: postResponse,
        hasMore,
      };
    } catch (error: any) {
      this.logger.error(`An error occurred finding all posts by postType: ${postType}`, error);
      throw error;
    }
  }


  async findFriendPosts(
    postType: string,
    userRequestId: string,
    userRelationMap: Map<string, string>,
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<any> {
    try {
      const conditions = Array.from(userRelationMap.entries()).map(([key, value]) => ({
        author: key,
        'visibility.post': value,
      }));

      let friendPosts: any;

      if (searchTerm) {
        const textSearchQuery = checkStopWordsAndReturnSearchQuery(searchTerm, SearchType.post);
        if (!textSearchQuery) {
          this.logger.log('No valid search terms provided. Returning empty result.');
          return { posts: [], hasMore: false };
        }

        friendPosts = await this.postDocument.find({
          $and: [
            { postType },
            { $or: conditions },
            {
              $or: [
                { searchTitle: { $regex: textSearchQuery, $options: "i" } },
                { searchDescription: { $regex: textSearchQuery, $options: "i" } }
              ]
            }
          ]
        })
          .skip((page - 1) * limit)
          .limit(limit + 1);
      } else {
        friendPosts = await this.postDocument.find({
          postType,
          $or: conditions,
        })
          .skip((page - 1) * limit)
          .limit(limit + 1);
      }

      if (!friendPosts || friendPosts.length === 0) {
        return { posts: [], hasMore: false };
      }

      const hasMore = friendPosts.length > limit;
      const postResponse = friendPosts.slice(0, limit);

      return {
        posts: postResponse,
        hasMore,
      };
    } catch (error: any) {
      this.logger.error('Error fetching friend posts:', error.message);
      throw new Error('Unable to fetch friend posts. Please try again later.');
    }
  }






  async saveGoodPost(
    baseObj: any,
    post: PostGood,
    options?: { session?: ClientSession },
  ): Promise<string> {
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
      const documentSaved: any = await postPostedDocument.save(options);
      this.logger.log('Post good created successfully');
      return documentSaved._id.toString();

    } catch (error: any) {
      this.logger.error('Error creating PostGood REPOSITORY: ' + error);
      throw error;
    }
  }
  async saveServicePost(
    baseObj: any,
    post: PostService,
    options?: { session?: ClientSession },
  ): Promise<string> {
    try {
      const newPost = {
        ...baseObj,
        frequencyPrice: post.getfrequencyPrice,
        imagesUrls: post.getImageUrls,
        reviews: post.getReviews,
      };

      const postPostedDocument = new this.postServiceDocument(newPost);
      const documentSaved: any = await postPostedDocument.save(options);


      this.logger.log('Post service created successfully');
      return documentSaved._id.toString();
    } catch (error: any) {
      this.logger.error('Error creating PostService REPOSITORY: ' + error);
      throw error;
    }
  }

  async savePetitionPost(
    baseObj: any,
    post: PostPetition,
    options?: { session?: ClientSession },
  ): Promise<string> {
    try {
      const newPost = {
        ...baseObj,
        toPrice: post.getToPrice,
        frequencyPrice: post.getFrequencyPrice,
        petitionType: post.getPetitionType,
      };

      const postPostedDocument = new this.postPetitionDocument(newPost);
      const documentSaved: any = await postPostedDocument.save(options);
      this.logger.log('Post service created successfully');
      return documentSaved._id.toString();
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

  async makeReactionSchemaAndSetReactionToPost(postId: string, reaction: { user: string, reaction: string }, session: any): Promise<void> {
    try {
      const postReaction = new this.postReactionDocument(reaction);
      const postReactionSaved = await postReaction.save(session);
      if (!postReactionSaved._id) {
        throw new Error('Error saving post reaction');
      }
      await this.postDocument.updateOne(
        { _id: postId },
        { $push: { postReactions: postReactionSaved._id } }
      ).session(session);
    } catch (error: any) {
      throw error;
    }
  }


}
