// Transforma las solicitudes del exterior (controllers) a objetos de dominio (entities)
import { omitBy, isUndefined } from 'lodash';
import { BadRequestException } from '@nestjs/common';

import { PostUpdateDto } from 'src/contexts/module_post/post/domain/post/entity/dto/post.update.dto';
import { PostGood } from 'src/contexts/module_post/post/domain/post/entity/post-types/post.good.entity';
import { PostPetition } from 'src/contexts/module_post/post/domain/post/entity/post-types/post.petition.entity';
import { PostService } from 'src/contexts/module_post/post/domain/post/entity/post-types/post.service.entity';
import { Post } from 'src/contexts/module_post/post/domain/post/entity/post.entity';
import { PostMapperAdapterInterface } from 'src/contexts/module_post/post/application/post/adapter/mapper/post.adapter.mapper.interface';
import { PostUpdateRequest } from 'src/contexts/module_post/post/application/post/dto/HTTP-REQUEST/post.update.request';
import {
  PostResponse,
  PostGoodResponse,
  PostServiceResponse,
  PostPetitionResponse,
} from 'src/contexts/module_post/post/application/post/dto/HTTP-RESPONSE/post.response';

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
          imagesUrls: postGood.getImageUrls,
          year: postGood.getYear ?? undefined,
          brand: postGood.getBrand ?? undefined,
          modelType: postGood.getModel ?? undefined,
          reviews: postGood.getReviews ?? ([] as any),
          condition: postGood.getCondition,
        };

        return postGoodResponse;
      case 'service':
        const postService = entity as PostService;
        const postServiceResponse: PostServiceResponse = {
          ...baseResponse,
          frequencyPrice: postService.getfrequencyPrice ?? '',
          imagesUrls: postService.getImageUrls ?? ([] as any),
          reviews: (postService.getReviews as any) ?? ([] as any),
        };

        return postServiceResponse;

      case 'petition':
        const postPetition = entity as PostPetition;
        const postPetitionResponse: PostPetitionResponse = {
          ...baseResponse,
          toPrice: postPetition.getToPrice,
          frequencyPrice: postPetition.getFrequencyPrice,
          petitionType: postPetition.getPetitionType,
        };
        return postPetitionResponse;
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
      request.description ?? null,
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
          postBase,
          request.imagesUrls,
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
          request.imagesUrls ?? [],
          request.reviews ?? [],
        );
      case 'petition':
        return new PostPetition(
          postBase,
          request.toPrice ?? null,
          request.frequencyPrice ?? null,
          request.petitionType,
        );

      default:
        throw Error('Invalid post type: ' + postTypetNormalized);
    }
  }
  requestUpdateToEntity(postUpdateRequest: PostUpdateRequest): PostUpdateDto {
    const postUpdateDto: PostUpdateDto = {
      title: postUpdateRequest.title,
      description: postUpdateRequest.description,
      visibility: postUpdateRequest.visibility,
      price: postUpdateRequest.price,
      //location: postUpdateRequest.location,
      category: postUpdateRequest.category,
      attachedFiles: postUpdateRequest.attachedFiles,
      imagesUrls: postUpdateRequest.imagesUrls,
      year: postUpdateRequest.year,
      brand: postUpdateRequest.brand,
      modelType: postUpdateRequest.modelType,
      condition: postUpdateRequest.condition,
      frequencyPrice: postUpdateRequest.frequencyPrice,
      toPrice: postUpdateRequest.toPrice,
      petitionType: postUpdateRequest.petitionType,
    };
    const postMapped = omitBy(postUpdateDto, isUndefined);

    return postMapped;
  }
}
