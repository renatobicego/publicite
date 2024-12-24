import { PostRequest } from "../entity/models_graphql/HTTP-REQUEST/post.request";
import { PostType } from "../entity/enum/post-type.enum";
import { Post } from "../entity/post.entity";

export interface PostFactoryInterface {
    createPost(postType: PostType, post: PostRequest): Post
}