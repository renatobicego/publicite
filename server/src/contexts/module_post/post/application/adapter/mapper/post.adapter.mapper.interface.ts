import { PostUpdateRequest } from '../../../domain/entity/models_graphql/HTTP-REQUEST/post.update.request';
import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';

export interface PostMapperAdapterInterface {

  requestUpdateToEntity(request: PostUpdateRequest): PostUpdateDto;
}
