// Transforma las solicitudes del exterior (controllers) a objetos de dominio (entities)

import { BadRequestException } from '@nestjs/common';
import {
  PostGoodResponse,
  PostResponse,
} from 'src/contexts/post/application/adapter/dto/post.response';
import { PostMapperAdapterInterface } from 'src/contexts/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostGood } from 'src/contexts/post/domain/entity/post-types/post.good.entity';
import { Post } from 'src/contexts/post/domain/entity/post.entity';

export class PostAdapterMapper implements PostMapperAdapterInterface {
  entityToResponse(entity: Post): PostResponse {
    const baseResponse: PostResponse = {
      title: entity.getTitle,
      author: entity.getAuthor as any,
      postType: entity.getPostType,
      description: entity.getDescription,
      visibility: entity.getVisibility as any,
      recomendations: entity.getRecomendations,
      price: entity.getPrice,
      location: entity.getLocation as any,
      category: entity.getCategory,
      comments: entity.getComments,
      attachedFiles: entity.getAttachedFiles,
      createAt: entity.getCreateAt,
      _id: entity.getId as any,
    };

    // Mapeamos dependiendo del tipo de post
    switch (entity.getPostType.toLowerCase()) {
      case 'good':
        const postGood = entity as PostGood;
        const postGoodResponse: PostGoodResponse = {
          ...baseResponse,
          imageUrls: postGood.getImageUrls,
          year: postGood.getYear ?? 0,
          brand: postGood.getBrand ?? '',
          modelType: postGood.getModel ?? '',
          reviews: postGood.getReviews ?? ([] as any),
          condition: postGood.getCondition,
        };

        return postGoodResponse;
      case 'service':
        // Implementación para PostService si tienes una subclase PostServiceResponse
        throw new BadRequestException('PostService mapping not implemented');

      case 'petition':
        // Implementación para PostPetition si tienes una subclase PostPetitionResponse
        throw new BadRequestException('PostPetition mapping not implemented');

      default:
        throw new BadRequestException(
          `Invalid post type: ${entity.getPostType}`,
        );
    }
  }
  requestToEntity(request: any): Post {
    const postTypetNormalized = request.postType.toLowerCase();
    const visibilityNormalizated = {
      post: request.visibility.post.toLowerCase(),
      socialMedia: request.visibility.socialMedia.toLowerCase(),
    };

    switch (postTypetNormalized) {
      case 'good':
        const postt = new PostGood(
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
          request.imageUrls,
          request.year ?? null,
          request.brand ?? null,
          request.modelType ?? null,
          request.reviews ?? [],
          request.condition ?? null,
        );

        return postt;
      case 'service':
        throw BadRequestException;
      case 'petition':
        throw BadRequestException;

      default:
        throw BadRequestException;
    }
  }
}
