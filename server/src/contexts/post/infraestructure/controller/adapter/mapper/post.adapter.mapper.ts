// Transforma las solicitudes del exterior (controllers) a objetos de dominio (entities)

import { PostResponse } from 'src/contexts/post/application/adapter/dto/post.response';
import { PostMapperAdapterInterface } from 'src/contexts/post/application/adapter/mapper/post.adapter.mapper.interface';
import { Post } from 'src/contexts/post/domain/entity/post.entity';

export class PostAdapterMapper implements PostMapperAdapterInterface {
  entityToResponse(entity: Post): PostResponse {
    // ver de cambiar el any por el tipo de response
    return {
      _id: entity.getId as any,
      title: entity.getTitle,
      author: entity.getAuthor as any,
      postType: entity.getPostType,
      description: entity.getDescription,
      visibility: entity.getVisibility as any,
      recomendations: entity.getRecomendations as any,
      price: entity.getPrice,
      location: entity.getLocation as any,
      category: entity.getCategory as any,
      comments: entity.getComments as any,
      attachedFiles: entity.getAttachedFiles as any,
      createAt: entity.getCreateAt,
    };
  }
  requestToEntity(request: any): Post {
    const postTypetNormalized = request.postType.toLowerCase();
    const visibilityNormalizated = {
      post: request.visibility.post.toLowerCase(),
      socialMedia: request.visibility.socialMedia.toLowerCase(),
    };
    return new Post(
      request.title,
      request.author,
      postTypetNormalized,
      request.description,
      visibilityNormalizated,
      request.recomendation ?? [],
      request.price,
      request.location,
      request.category ?? [],
      request.comments ?? [],
      request.attachedFiles ?? [],
      request.createAt,
    );
  }
}
