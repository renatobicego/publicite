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
import {
  checkStopWordsAndReturnSearchQuery,
  SearchType,
} from 'src/contexts/module_shared/utils/functions/checkStopWordsAndReturnSearchQuery';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';
import { PostReactionDocument } from '../schemas/post.reaction.schema';
import { PostsMemberGroupResponse } from 'src/contexts/module_shared/sharedGraphql/group.posts.member.response';

import { PostBehaviourType } from '../../domain/entity/enum/postBehaviourType.enum';

import { VisibilityEnum } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.update.request';
import { PostComment } from '../../domain/entity/postComment.entity';
import { PostCommentDocument } from '../schemas/post.comment.schema';
import { Date } from 'mongoose';
import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import { downgrade_plan_post_notification } from 'src/contexts/module_shared/event-emmiter/events';

export class PostRepository implements PostRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    private readonly emmiter: EmitterService,
    @InjectConnection()
    private readonly connection: Connection,

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

    @InjectModel('PostComment')
    private readonly postCommentDocument: Model<PostCommentDocument>,

    @InjectModel('Post')
    private readonly postDocument: Model<PostDocument>,



  ) { }

  async activateOrDeactivatePost(_id: string, activate: boolean): Promise<any> {
    try {
      await this.postDocument.updateOne(
        { _id },
        { $set: { isActive: activate } },
      );
    } catch (error: any) {
      throw error;
    }
  }

  async create(
    post: Post,
    options?: { session?: ClientSession },
  ): Promise<string> {
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
        postBehaviourType: post.getPostBehaviourType,
        isActive: post.getIsActive,
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
        const postDeleted = await this.postDocument
          .findByIdAndDelete(id, {
            session,
          })
          .select('author comments reactions');
        if (!postDeleted) throw new Error('Post not found');

        const deletePromises = [
          //- Falta reviews

          //Reactions
          this.postReactionDocument.deleteMany(
            { _id: { $in: postDeleted.reactions } },
            { session },
          ),

          //Comments
          this.postCommentDocument.deleteMany(
            { _id: { $in: postDeleted.comments } },
            { session },
          ),
          //User
          this.userDocument.updateOne(
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

  async desactivateAllPost(
    userId: string,
    criteria: { [key: string]: number },
  ): Promise<void> {
    try {
      const randomIds: string[] = [];

      for (const [postBehaviourType, count] of Object.entries(criteria)) {
        if (count > 0) {
          const aggregationPipeline = [
            { $match: { author: userId, postBehaviourType, isActive: true } },
            { $sample: { size: count } },
            { $project: { _id: 1 } },
          ];

          const randomDocuments = await this.postDocument
            .aggregate(aggregationPipeline)
            .exec();
          randomDocuments.forEach((doc) => randomIds.push(doc._id));
        }
      }

      if (randomIds.length === 0) {
        console.log('No se encontraron documentos para desactivar.');
        return;
      }

      const result = await this.postDocument.updateMany(
        { _id: { $in: randomIds } },
        { $set: { isActive: false } },
      );

      console.log(`${result.modifiedCount} posts desactivados.`);
      this.emmiter.emit(downgrade_plan_post_notification, userId);
    } catch (error) {
      console.error('Error al desactivar posts:', error);
      throw error;
    }
  }

  async deleteCommentById(
    id: string,
    userRequestId: string,
    isAuthorOfPost: boolean,
  ): Promise<void> {
    try {
      if (isAuthorOfPost) {
        const result = await this.postDocument.updateOne(
          { author: userRequestId },
          { $pull: { comments: id } },
        );
        if (result.modifiedCount > 0) {
          await this.postCommentDocument.deleteOne({ _id: id });
        }
      } else {
        const result = await this.postCommentDocument.deleteOne({
          _id: id,
          user: userRequestId,
        });
        if (result.deletedCount > 0) {
          await this.postDocument.updateOne(
            { comments: id },
            { $pull: { comments: id } },
          );
        }
      }
    } catch (error: any) {
      throw error;
    }
  }

  async findPostsByAuthorId(id: string): Promise<any> {
    try {
      this.logger.log('Finding posts by author id in repository');
      const posts = await this.postDocument
        .find({ author: id })
        .select('-searchTitle -searchDescription')
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
    this.logger.log('Finding post by id in repository');

    try {
      const post = await this.postDocument
        .findById(id)
        .select('-searchTitle -searchDescription')
        .populate([
          { path: 'category', model: 'PostCategory' },
          {
            path: 'author',
            model: 'User',
            select: '_id profilePhotoUrl username lastName name contact',
            populate: { path: 'contact', model: 'Contact' },
          },
          {
            path: 'reactions',
            model: 'PostReaction',
            select: 'user reaction _id',
          },
          {
            path: 'reviews',
            model: 'PostReview',
          },
          {
            path: 'comments',
            model: 'PostComment',
            populate: [
              {
                path: 'user',
                model: 'User',
                select: '_id profilePhotoUrl username',
              },
              {
                path: 'response',
                model: 'PostComment',
                populate: {
                  path: 'user',
                  model: 'User',
                  select: '_id profilePhotoUrl username',
                },
              },
            ],
          },
        ])
        .lean();

      return post;
    } catch (error: any) {
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
      }
      ).populate([
        {
          path: 'reviews',
          model: 'PostReview',
        },
      ]).lean()
    } catch (error: any) {
      throw error;
    }
  }

  async findFriendPosts(
    postType: string,
    userRelationMap: Map<string, string[]>,
    page: number,
    limit: number,
    searchTerm?: string,
  ): Promise<any> {
    try {
      const conditions = Array.from(userRelationMap.entries()).map(
        ([key, value]) => ({
          author: key,
          'visibility.post': { $in: value },
        }),
      );

      let friendPosts: any;

      if (searchTerm) {
        const textSearchQuery = checkStopWordsAndReturnSearchQuery(
          searchTerm,
          SearchType.post,
        );
        if (!textSearchQuery) {
          this.logger.log(
            'No valid search terms provided. Returning empty result.',
          );
          return { posts: [], hasMore: false };
        }

        friendPosts = await this.postDocument
          .find({
            $and: [
              { postType, isActive: true },
              { $or: conditions },
              {
                $or: [
                  { searchTitle: { $regex: textSearchQuery, $options: 'i' } },
                  {
                    searchDescription: {
                      $regex: textSearchQuery,
                      $options: 'i',
                    },
                  },
                ],
              },
            ],
          })
          .populate([
            {
              path: 'reviews',
              model: 'PostReview',
            },
          ])
          .skip((page - 1) * limit)
          .limit(limit + 1);
      } else {
        friendPosts = await this.postDocument
          .find({
            postType,
            isActive: true,
            $or: conditions,
          })
          .populate([
            {
              path: 'author',
              model: 'User',
              select: '_id profilePhotoUrl username lastName name contact',
              populate: [{
                path: 'contact',
                model: 'Contact',
              },
              ]
            },
            {
              path: 'reviews',
              model: 'PostReview',
            },
          ])
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

  async findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
    userRequestId?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Finding posts by postType: ${postType}`);
      const today = new Date();

      // Prepara el stage de filtrado
      const matchStage: any = {
        postType,
        'visibility.post': 'public',
        isActive: true,
        endDate: { $gte: today },
      };

      if (userRequestId) {
        matchStage.author = { $ne: userRequestId };
      }

      // Si se especifica un término de búsqueda, lo procesamos
      if (searchTerm) {
        const textSearchQuery = checkStopWordsAndReturnSearchQuery(
          searchTerm,
          SearchType.post,
        );
        if (!textSearchQuery) {
          this.logger.log(
            'No valid search terms provided. Returning empty result.',
          );
          return { posts: [], hasMore: false };
        }

        matchStage.$or = [
          { searchTitle: { $regex: textSearchQuery, $options: 'i' } },
          { searchDescription: { $regex: textSearchQuery, $options: 'i' } },

        ];
        matchStage.postBehaviourType = "libre";


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
              {
                $project: {
                  _id: 1,
                  profilePhotoUrl: 1,
                  username: 1,
                  lastName: 1,
                  name: 1,
                  contact: 1,
                },
              },
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
              {
                $project: {
                  _id: 1,
                  facebook: 1,
                  phone: 1,
                  instagram: 1,
                  website: 1,
                  x: 1,
                },
              },
            ], // Solo traemos los campos necesarios
          },
        },
        {
          $unwind: {
            path: '$author.contact',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'postcategories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
            pipeline: [{ $project: { _id: 1, label: 1 } }], // Solo traemos los campos necesarios
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
      if (!posts) {
        return { posts: [], hasMore: false };
      }

      // Determinamos si hay más posts basados en el límite
      const hasMore = posts.length > limit;
      const postResponse = posts.slice(0, limit); // Solo devolvemos hasta el límite

      return {
        posts: postResponse,
        hasMore,
      };
    } catch (error: any) {
      this.logger.error(
        `An error occurred finding all posts by postType: ${postType}`,
        error,
      );
      throw error;
    }
  }

  async findPostOfGroupMembers(
    membersId: any[],
    conditionsOfSearch: any[],
    userLocation: UserLocation,
    limit: number,
    page: number,
  ): Promise<PostsMemberGroupResponse | null> {
    try {
      if (membersId.length === 0) return { userAndPosts: [], hasMore: false };

      const pipeline: any[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLocation.longitude, userLocation.latitude],
            },
            distanceField: 'distance',
            spherical: true,
          },
        },
        {
          $match: {
            $or: [
              {
                $and: [
                  { author: { $in: membersId } },
                  { postBehaviourType: 'libre' },
                  { isActive: true },
                  { $expr: { $lte: ['$distance', '$geoLocation.ratio'] } },
                ],
              },
              {
                $and: [
                  { $or: conditionsOfSearch },
                  { postBehaviourType: 'agenda' },
                  { isActive: true },
                ],
              },
            ],
          },
        },
        {
          $addFields: {
            authorObjectId: { $toObjectId: '$author' }, // Convierte el autor a ObjectId
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorObjectId',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  lastName: 1,
                  profilePhotoUrl: 1,
                  username: 1,
                },
              },
            ],
          },
        },
        { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'postreviews', // NOMBRE SCHEMA
            localField: 'reviews', // El campo en 'posts' que contiene los ObjectId de 'PostReview'
            foreignField: '_id', // El campo que se compara en la colección 'PostReview'
            as: 'reviews', // El nombre del campo donde se guardarán las reseñas pobladas
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit + 1 }, // Se toma 1 extra para verificar si hay más páginas
      ];

      const posts = await this.postDocument.aggregate(pipeline);

      if (!posts || posts.length === 0) {
        return { userAndPosts: [], hasMore: false };
      }

      const hasMore = posts.length > limit;
      const postResponse = posts.slice(0, limit);

      return {
        userAndPosts: postResponse,
        hasMore,
      };
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }


  async findPostByIdAndCategoryPostsRecomended(id: string): Promise<any> {
    try {
      const today = new Date();
      const postById = await this.findPostById(id);
      if (!postById) return { post: null, recomended: [] };
      const category = postById.category[0]._id ?? null;
      const userLocation = postById.geoLocation.location.coordinates;
      const query = {
        isActive: true,
        endDate: { $gte: today },
        category: category,
        _id: { $ne: postById._id },
        postType: postById.postType,
      };

      const pipeline: any = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: userLocation,
            },
            distanceField: 'distance',
            spherical: true,
            query: query,
          },
        },
        {
          $match: {
            $expr: { $lte: ['$distance', '$geoLocation.ratio'] },
          },
        },
        { $limit: 4 }, // Limitar los resultados a 4
      ];

      if (postById.postType !== PostType.petition) {
        pipeline.push(
          {
            $lookup: {
              from: 'postreviews', // NOMBRE SCHEMA
              localField: 'reviews', // El campo en 'posts' que contiene los ObjectId de 'PostReview'
              foreignField: '_id', // El campo que se compara en la colección 'PostReview'
              as: 'reviews', // El nombre del campo donde se guardarán las reseñas pobladas
            },
          },

        );
      }


      const posts = await this.postDocument.aggregate(pipeline);

      return {
        post: postById,
        recomended: posts,
      };
    } catch (error: any) {
      throw error;
    }
  }



  async setResponseOnComment(
    commentId: string,
    responseId: string,
    session: any,
  ): Promise<any> {
    try {
      return await this.postCommentDocument.updateOne(
        { _id: commentId },
        { $set: { response: responseId } },
        { session },
      );
    } catch (error: any) {
      throw error;
    }
  }

  async savePostComment(postComment: PostComment, session: any): Promise<any> {
    try {
      const postCommentDocument = new this.postCommentDocument(postComment);
      const postCommentSaved = await postCommentDocument.save({ session });

      const populatedPostComment = await postCommentSaved.populate({
        path: 'user',
        select: 'username profilePhotoUrl',
      });

      return populatedPostComment;
    } catch (error: any) {
      throw error;
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

  async setCommenOnPost(
    postId: string,
    postCommentId: string,
    session: any,
  ): Promise<any> {
    try {
      await this.postDocument.updateOne(
        { _id: postId },
        { $push: { comments: postCommentId } },
        { session },
      );
    } catch (error: any) {
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

  async updateCommentById(
    id: string,
    comment: string,
    userRequestId: string,
  ): Promise<any> {
    try {
      return await this.postCommentDocument.updateOne(
        { _id: id, user: userRequestId },
        { $set: { comment, isEdited: true } },
        { new: true },
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateEndDateFromPostById(
    postId: string,
    userRequestId: string,
    newDate: Date,
  ): Promise<any> {
    try {
      await this.postDocument.updateOne(
        { _id: postId, author: userRequestId },
        { $set: { endDate: newDate } },
      );

      this.logger.log(
        `Updating end date from post with id: ${postId} successfully updated`,
      );
      return `End Date from post with id: ${postId} successfully updated`;
    } catch (error: any) {
      this.logger.error('Error updating end date:', error);
      throw error;
    }
  }

  async updateBehaviourType(
    _id: string,
    objectUpdate: {
      postBehaviourType: PostBehaviourType;
      visibility: VisibilityEnum;
    },
  ): Promise<any> {
    try {
      await this.postDocument.updateOne({ _id }, objectUpdate);
    } catch (error: any) {
      throw error;
    }
  }

  async makeReactionSchemaAndSetReactionToPost(
    postId: string,
    reaction: { user: string; reaction: string },
    session: any,
  ): Promise<any> {
    try {
      const postReaction = new this.postReactionDocument(reaction);
      const postReactionSaved = await postReaction.save(session);
      if (!postReactionSaved._id) {
        throw new Error('Error saving post reaction');
      }
      await this.postDocument
        .updateOne(
          { _id: postId },
          { $push: { reactions: postReactionSaved._id } },
        )
        .session(session);

      return postReactionSaved._id;
    } catch (error: any) {
      throw error;
    }
  }

  async removeReactionFromPost(
    userRequestId: string,
    _id: string,
  ): Promise<any> {
    try {
      const result = await this.postReactionDocument.deleteOne({
        user: userRequestId,
        _id: _id,
      });
      if (result.deletedCount > 0) {
        await this.postDocument.updateOne(
          { reactions: _id },
          { $pull: { reactions: _id } },
        );
      }
    } catch (error: any) {
      throw error;
    }
  }
}

/*

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
      from: 'postcategories',
      localField: 'category',
      foreignField: '_id',
      as: 'category',
      pipeline: [{ $project: { _id: 1, label: 1 } }],
    },
  },
  {
    $addFields: {
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
  {
    $project: {
      _id: 1,
      title: 1,
      description: 1,
      frequencyPrice: 1,
      imagesUrls: 1,
      petitionType: 1,
      postType: 1,
      price: 1,
      reviews: 1,
      toPrice: 1,
      'geoLocation.description': 1,
    },
  },
  { $skip: (page - 1) * limit },
  { $limit: limit + 1 },
]);
*/
