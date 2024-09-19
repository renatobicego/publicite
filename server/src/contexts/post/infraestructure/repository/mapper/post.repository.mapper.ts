import { error } from 'console';
import { PostGood } from 'src/contexts/post/domain/entity/post-types/post.good.entity';
import { PostService } from 'src/contexts/post/domain/entity/post-types/post.service.entity';
import { Post } from 'src/contexts/post/domain/entity/post.entity';
import { PostRepositoryMapperInterface } from 'src/contexts/post/domain/repository/mapper/post.repository.mapper.interface';

export class PostRepositoryMapper implements PostRepositoryMapperInterface {
  documentToEntityMapped(document: any): Post {
    const post: Post = new Post(
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
    );
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
      case 'service':
        return new PostService(
          post,
          document.frequencyPrice,
          document.imageUrls,
          document.reviews,
        );
      default:
        throw error;
    }
  }
}
