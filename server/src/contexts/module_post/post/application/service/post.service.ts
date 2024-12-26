import { Inject } from '@nestjs/common';
import { Connection, ObjectId } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';


import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { PostUpdateDto } from '../../domain/entity/dto/post.update.dto';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { PostServiceInterface } from '../../domain/service/post.service.interface';
import { PostRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { PostFactory } from '../post-factory/post.factory';
import { PostType } from '../../domain/entity/enum/post-type.enum';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';
import { calculateDistance } from '../../domain/utils/calculateDistance';



export class PostService implements PostServiceInterface {
  constructor(
    @Inject('PostRepositoryInterface')
    private readonly postRepository: PostRepositoryInterface,
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) { }

  async findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
  ): Promise<any> {
    try {
      const posts = await this.postRepository.findAllPostByPostType(
        page,
        limit,
        postType,
        userLocation,
        searchTerm,
      );

      if (posts.posts && posts.posts.length > 0) {

        const postWithInRadius = posts.posts.filter((post: any) => {
          const distance = calculateDistance(userLocation, post.geoLocation.location);
          return distance <= post.geoLocation.radius;
        })

        return {
          posts: postWithInRadius,
          hasMore: posts.hasMore
        };
      }

      return posts;
    } catch (error: any) {
      throw error;
    }
  }

  async create(post: PostRequest): Promise<any> {
    const postType = post.postType.toLowerCase();
    if (!postType) throw new Error('Post type is required');
    const postFactory = PostFactory.getInstance(this.logger);
    const postMapped = postFactory.createPost(postType as PostType, post);

    const session = await this.connection.startSession();
    let newPostId: String;
    try {
      const newPostIdId = await session.withTransaction(async () => {

        //Post to save
        newPostId = await this.postRepository.create(postMapped, {
          session,
        });
        if (!newPostId) {
          throw new Error('Error al crear el post');
        }

        //Post to save in user
        await this.userService.saveNewPostInUser(newPostId, post.author, {
          session,
        });
        return newPostId;
      });

      //Todo ok
      await session.commitTransaction();

      return {
        _id: newPostIdId,
      };
    } catch (error: any) {
      throw error;
    } finally {
      session.endSession();
    }
  }



  async deletePostById(id: string): Promise<void> {
    try {
      this.logger.log('Deleting post with id: ' + id);
      await this.postRepository.deletePostById(id);
    } catch (error: any) {
      this.logger.log('An error was ocurred deleting a post with id: ' + id);
      throw error;
    }
  }

  async findPostsByAuthorId(id: string): Promise<any> {
    try {
      this.logger.log('Finding posts by author id: ' + id);
      return await this.postRepository.findPostsByAuthorId(id);
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred finding posts by author id: ' + id,
      );
      throw error;
    }
  }
  async findPostById(id: string): Promise<void> {
    try {
      this.logger.log('Finding posts by  id: ' + id);
      return await this.postRepository.findPostById(id);
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred finding posts by author id: ' + id,
      );
      throw error;
    }
  }

  async updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
  ): Promise<any> {
    try {
      return await this.postRepository.updatePostById(postUpdate, id, postType);
    } catch (error: any) {
      throw error;
    }
  }

  async updateEndDateFromPostById(postId: string, userRequestId: string): Promise<void> {
    try {
      this.logger.log('Updating end date from post with id: ' + postId);
      return await this.postRepository.updateEndDateFromPostById(postId, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

}
