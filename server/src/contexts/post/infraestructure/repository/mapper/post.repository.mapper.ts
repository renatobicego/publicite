import { Post } from 'src/contexts/post/domain/entity/post.entity';
import { PostRepositoryMapperInterface } from 'src/contexts/post/domain/repository/mapper/post.repository.mapper.interface';

export class PostRepositoryMapper implements PostRepositoryMapperInterface {
  documentToEntityMapped(document: any): Post {
    return new Post(
      document.title,
      document.author,
      document.postType,
      document.description,
      document.visibility,
      document.recomendations,
      document.price,
      document.location,
      document.category,
      document.comments,
      document.attachedFiles,
      document.createAt,
      document._id,
    );
  }
}
