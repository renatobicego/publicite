import { ClientSession, ObjectId } from 'mongoose';
import { Post } from '../entity/post.entity';
import { PostLocation } from '../entity/postLocation.entity';

export interface PostRepositoryInterface {
  create(
    post: Post,
    locationID: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<Post>;
  saveLocation(
    location: PostLocation,

    options?: { session?: ClientSession },
  ): Promise<ObjectId>;
}
