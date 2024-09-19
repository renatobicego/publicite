import { Inject } from '@nestjs/common';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { PostServiceInterface } from '../../domain/service/post.service.interface';
import { Post } from '../../domain/entity/post.entity';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ObjectId } from 'mongoose';
import { error } from 'console';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/user/domain/service/user.service.interface';

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
    let locationID: ObjectId;

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      try {
        locationID = await this.postRepository.saveLocation(post.getLocation, {
          session,
        });
      } catch (error: any) {
        this.logger.error(
          'An error was ocurring while saving the location in post',
        );
        await session.abortTransaction();
        session.endSession();
        throw error;
      }

      const newPost: Post = await this.postRepository.create(post, locationID, {
        session,
      });
      if (!newPost.getId) {
        this.logger.error(
          "An error was ocurred. We couldn't get the id of the post. The post was not created",
        );
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
      try {
        await this.userService.saveNewPost(
          newPost.getId as unknown as ObjectId,
          newPost.getAuthor,
          {
            session,
          },
        );
      } catch (error: any) {
        //Falla el servicio del user
        this.logger.error(
          'An error was ocurring while saving the post in user',
          error,
        );
        await session.abortTransaction();
        session.endSession();
        throw error;
      }

      //Todo ok
      await session.commitTransaction();
      await session.endSession();
      return newPost;
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
