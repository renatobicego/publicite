import { Post } from 'src/contexts/post/domain/entity/post.entity';

export interface PostMapperAdapterInterface {
  requestToEntity(request: any): Post;
  entityToResponse(entity: Post): any;
}
