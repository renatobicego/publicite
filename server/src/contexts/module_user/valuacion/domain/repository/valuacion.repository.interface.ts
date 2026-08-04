import { ValuacionEntity } from '../entity/valuacion.entity';

export interface ValuacionListResult {
  valuaciones: ValuacionEntity[];
  total: number;
  hasMore: boolean;
}

export interface ValuacionRepositoryInterface {
  create(valuacion: Partial<ValuacionEntity>): Promise<ValuacionEntity>;

  /** Devuelve null si no existe o si está borrada lógicamente. */
  findById(valuacionId: string): Promise<ValuacionEntity | null>;

  findByUser(
    userId: string,
    limit: number,
    page: number,
  ): Promise<ValuacionListResult>;

  /** Última valuación no borrada asociada a un anuncio. */
  findByPostId(postId: string): Promise<ValuacionEntity | null>;

  update(
    valuacionId: string,
    changes: Record<string, any>,
  ): Promise<ValuacionEntity | null>;

  /** Soft delete: marca deletedAt y status archived (AC06 Tablero). */
  softDelete(valuacionId: string): Promise<boolean>;

  /** Valuaciones creadas por el usuario desde una fecha (para el rate limit diario). */
  countCreatedSince(userId: string, since: Date): Promise<number>;
}
