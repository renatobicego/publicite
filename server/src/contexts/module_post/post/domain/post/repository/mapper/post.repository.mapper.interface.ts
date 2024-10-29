import { Post } from '../../entity/post.entity';

export interface PostRepositoryMapperInterface {
  documentToEntityMapped(document: any): Post;
}
