import { ClientSession, ObjectId } from 'mongoose';
import { Post } from '../entity/post.entity';
import { PostLocation } from '../entity/postLocation.entity';
import { PostUpdateDto } from '../entity/dto/post.update.dto';

export interface PostRepositoryInterface {
  create(
    post: Post,
    locationID: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<Post>;

  deletePostById(id: string): Promise<any>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<void>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    searchTerm?: string,
  ): Promise<void>;

  saveLocation(
    location: PostLocation,
    options?: { session?: ClientSession },
  ): Promise<ObjectId>;

  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
  ): Promise<any>;
  updateEndDateFromPostById(postId: string, userRequestId: string): Promise<void>;
}
