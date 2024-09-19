// Transforma las solicitudes del exterior (controllers) a objetos de dominio (entities)

import { BadRequestException } from '@nestjs/common';
import {
  PostGoodResponse,
  PostResponse,
  PostServiceResponse,
} from 'src/contexts/post/application/adapter/dto/post.response';
import { PostMapperAdapterInterface } from 'src/contexts/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostGood } from 'src/contexts/post/domain/entity/post-types/post.good.entity';
import { PostService } from 'src/contexts/post/domain/entity/post-types/post.service.entity';
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
        const postService = entity as PostService;
        const postServiceResponse: PostServiceResponse = {
          ...baseResponse,
          frequencyPrice: postService.getfrequencyPrice ?? '',
          imageUrls: postService.getImageUrls ?? ([] as any),
          reviews: (postService.getReviews as any) ?? ([] as any),
        };
        return postServiceResponse;

      case 'petition':
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

    const postBase = new Post(
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

    switch (postTypetNormalized) {
      case 'good':
        return new PostGood(
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

      case 'service':
        return new PostService(
          postBase,
          request.frequencyPrice ?? null,
          request.imageUrls ?? [],
          request.reviews ?? [],
        );
      case 'petition':
        throw BadRequestException;

      default:
        throw BadRequestException;
    }
  }
}
