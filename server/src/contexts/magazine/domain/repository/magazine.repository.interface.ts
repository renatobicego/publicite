import { Magazine } from '../entity/magazine.entity';

export interface MagazineRepositoryInterface {
  save(magazine: Magazine): Promise<any>;
}
