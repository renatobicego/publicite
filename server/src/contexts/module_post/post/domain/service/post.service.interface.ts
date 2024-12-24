import { PostRequest } from "../entity/models_graphql/HTTP-REQUEST/post.request";
import { PostUpdateDto } from "../entity/dto/post.update.dto";



export interface PostServiceInterface {
  create(post: PostRequest): Promise<void>;
  findPostsByAuthorId(id: string): Promise<void>;
  findPostById(id: string): Promise<any>;
  findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    searchTerm?: string,
  ): Promise<void>;
  deletePostById(id: string): Promise<void>;
  updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
    cookie?: any,
  ): Promise<any>;
  updateEndDateFromPostById(postId: string, userRequestId: string): Promise<void>;
}
