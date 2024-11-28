// Transforma las solicitudes del exterior (controllers) a objetos de dominio (entities)
import { omitBy, isUndefined } from 'lodash';


import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';
import { PostMapperAdapterInterface } from 'src/contexts/module_post/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostUpdateRequest } from 'src/contexts/module_post/post/application/dto/HTTP-REQUEST/post.update.request';

export class PostAdapterMapper implements PostMapperAdapterInterface {

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
