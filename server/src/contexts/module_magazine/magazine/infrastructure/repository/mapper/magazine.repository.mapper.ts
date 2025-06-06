import { MagazineResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineRepositoryMapperInterface } from '../../../domain/repository/mapper/magazine.respository.mapper.interface';

export class MagazineRepositoryMapper
  implements MagazineRepositoryMapperInterface
{
  toReponse(magazineDocument: any): Partial<MagazineResponse> {
    const response = new MagazineResponse(magazineDocument);
    return response;
  }
}
