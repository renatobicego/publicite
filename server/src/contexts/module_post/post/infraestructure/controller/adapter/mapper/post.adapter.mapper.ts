// Transforma las solicitudes del exterior (controllers) a objetos de dominio (entities)
import { omitBy, isUndefined } from 'lodash';


import { PostUpdateDto } from 'src/contexts/module_post/post/domain/entity/dto/post.update.dto';
import { PostMapperAdapterInterface } from 'src/contexts/module_post/post/application/adapter/mapper/post.adapter.mapper.interface';
import { PostUpdateRequest } from 'src/contexts/module_post/post/domain/entity/models_graphql/HTTP-REQUEST/post.update.request';
import { removeAccents_removeEmojisAndToLowerCase } from 'src/contexts/module_post/post/domain/utils/normalice.data';

export class PostAdapterMapper implements PostMapperAdapterInterface {

  requestUpdateToEntity(postUpdateRequest: PostUpdateRequest): PostUpdateDto {
    let searchDescription = undefined;
    let searchTitle = undefined;

    if (postUpdateRequest.description && postUpdateRequest.description.length > 0) {
      searchDescription = removeAccents_removeEmojisAndToLowerCase(postUpdateRequest.description);
    } if (postUpdateRequest.title && postUpdateRequest.title.length > 0) {
      searchTitle = removeAccents_removeEmojisAndToLowerCase(postUpdateRequest.title);
    }


    const postUpdateDto: PostUpdateDto = {
      title: postUpdateRequest.title,
      description: postUpdateRequest.description,
      searchTitle: searchTitle,
      searchDescription: searchDescription,
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
    
    return omitBy(postUpdateDto, isUndefined);
  }
}
