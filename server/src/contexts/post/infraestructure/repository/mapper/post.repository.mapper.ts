import { error } from 'console';
import { PostGood } from 'src/contexts/post/domain/entity/post-types/post.good.entity';
import { Post } from 'src/contexts/post/domain/entity/post.entity';
import { PostRepositoryMapperInterface } from 'src/contexts/post/domain/repository/mapper/post.repository.mapper.interface';

export class PostRepositoryMapper implements PostRepositoryMapperInterface {
  documentToEntityMapped(document: any): Post {
    switch (document.postType.toLowerCase()) {
      case 'good':
        return new PostGood(
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
          document.imageUrls,
          document.year,
          document.brand,
          document.modelType,
          document.reviews,
          document.condition,
          document._id,
        );
      default:
        throw error;
    }
  }
}
