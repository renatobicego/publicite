import { Inject } from '@nestjs/common';
import { Connection, ObjectId } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { PostServiceInterface } from '../../domain/service/post.service.interface';
import { Post } from '../../domain/entity/post.entity';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/user/domain/service/user.service.interface';
import { PostUpdateDto } from '../../domain/entity/dto/post.update.dto';

export class PostService implements PostServiceInterface {
  constructor(
    @Inject('PostRepositoryInterface')
    private readonly postRepository: PostRepositoryInterface,
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) {}

  async create(post: Post): Promise<Post> {
    const session = await this.connection.startSession();
    let locationID: ObjectId;
    let newPost: Post;
    try {
      await session.withTransaction(async () => {
        //Location to save
        locationID = await this.postRepository.saveLocation(post.getLocation, {
          session,
        });
        if (!locationID) {
          throw new Error('Error al guardar la ubicación');
        }

        //Post to save
        newPost = await this.postRepository.create(post, locationID, {
          session,
        });

        if (!newPost || !newPost.getId) {
          throw new Error('Error al crear el post');
        }

        //Post to save in user
        await this.userService.saveNewPost(newPost.getId, newPost.getAuthor, {
          session,
        });
        return newPost;
      });

      //Todo ok
      await session.commitTransaction();
      return newPost!; // Si marco como ! aseguro que no sera null ya que si llega a este retorno quiere decir que la transaccion se completo
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
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

  async findPostsByAuthorId(id: string): Promise<void> {
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

  async updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
    cookie?: any,
  ): Promise<any> {
    try {
      return await this.postRepository.updatePostById(postUpdate, id, postType);
    } catch (error: any) {
      throw error;
    }
  }
}
