import { MagazineResponse } from 'src/contexts/magazine/application/adapter/dto/HTTP-RESPONSE/magazine.reponse';

export interface MagazineRepositoryMapperInterface {
  toReponse(magazineDocument: any): Partial<MagazineResponse>;
}