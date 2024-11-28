import { PostUpdateRequest } from '../../dto/HTTP-REQUEST/post.update.request';
import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';

export interface PostMapperAdapterInterface {

  requestUpdateToEntity(request: PostUpdateRequest): PostUpdateDto;
}
