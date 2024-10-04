import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';

export interface MagazineServiceInterface {
  createMagazine(magazineRequest: MagazineCreateRequest): Promise<void>;
}
