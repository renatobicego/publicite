import { Post } from 'src/contexts/module_post/post/domain/entity/post.entity';
import { PostUpdateRequest } from '../../dto/HTTP-REQUEST/post.update.request';
import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';

export interface PostMapperAdapterInterface {
  requestToEntity(request: any): Post;
  entityToResponse(entity: Post): any;
  requestUpdateToEntity(request: PostUpdateRequest): PostUpdateDto;
}
