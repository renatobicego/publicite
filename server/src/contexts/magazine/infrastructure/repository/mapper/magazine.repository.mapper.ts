import { MagazineResponse } from 'src/contexts/magazine/application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineRepositoryMapperInterface } from 'src/contexts/magazine/domain/repository/mapper/magazine.respository.mapper.interface';

export class MagazineRepositoryMapper
  implements MagazineRepositoryMapperInterface
{
  toReponse(magazineDocument: any): Partial<MagazineResponse> {
    return new MagazineResponse(magazineDocument);
  }
}
