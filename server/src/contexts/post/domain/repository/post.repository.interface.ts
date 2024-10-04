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

  deletePostById(id: string): Promise<void>;
  saveLocation(
    location: PostLocation,
    options?: { session?: ClientSession },
  ): Promise<ObjectId>;

  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
  ): Promise<any>;
}
