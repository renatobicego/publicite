import { MagazineCreateRequest } from './dto/HTTP-REQUEST/magazine.create.request';

export interface MagazineAdapterInterface {
  createMagazine(magazineRequest: MagazineCreateRequest): Promise<any>;
}
