import { Post } from 'src/contexts/post/domain/post/entity/post.entity';
import { PostUpdateRequest } from '../../dto/HTTP-REQUEST/post.update.request';
import { PostUpdateDto } from 'src/contexts/post/domain/post/entity/dto/post.update.dto';

export interface PostMapperAdapterInterface {
  requestToEntity(request: any): Post;
  entityToResponse(entity: Post): any;
  requestUpdateToEntity(request: PostUpdateRequest): PostUpdateDto;
}
