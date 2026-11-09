import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Types } from 'mongoose';

import { formatBytes } from '../production-limits/production.limits.config';

export const USER_STORAGE_USAGE_SERVICE = 'UserStorageUsageService';

/** Peso de una foto o video de un anuncio (key de UploadThing tal como se guarda). */
export interface PostMediaSize {
  key: string;
  sizeBytes: number;
}

/**
 * Almacenamiento usado por un usuario: los archivos de todos sus blogs de Mis
 * Producciones + las fotos y videos de sus anuncios. Es un único cupo
 * (`subscriptionPlan.storageBytesLimit`), que se apaga con
 * `PRODUCTION_STORAGE_LIMIT_ENABLED`.
 *
 * Lee las colecciones directo de la conexión (no los modelos) para que lo
 * puedan usar Anuncios y Producciones sin depender uno del otro. El uso se
 * suma en vivo: borrar un anuncio o un archivo libera espacio solo.
 */
@Injectable()
export class UserStorageUsageService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  private toObjectId(id: string) {
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  }

  /** Bytes de los archivos (`kind: file`) de los blogs creados por el usuario. */
  async getProductionBytes(
    userId: string,
    session?: ClientSession,
  ): Promise<number> {
    const creator = this.toObjectId(userId);
    if (!creator) return 0;
    const productions = await this.connection
      .collection('productions')
      .find({ creator }, { projection: { _id: 1 }, session })
      .toArray();
    if (productions.length === 0) return 0;
    const [result] = await this.connection
      .collection('productionitems')
      .aggregate(
        [
          {
            $match: {
              production: { $in: productions.map((doc) => doc._id) },
              kind: 'file',
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $ifNull: ['$sizeBytes', 0] } },
            },
          },
        ],
        { session },
      )
      .toArray();
    return Number(result?.total) || 0;
  }

  /** Bytes de las fotos y videos de los anuncios del usuario. */
  async getPostMediaBytes(
    userId: string,
    session?: ClientSession,
    excludePostId?: string,
  ): Promise<number> {
    const author = this.toObjectId(userId);
    if (!author) return 0;
    const match: Record<string, any> = { author };
    const excluded = excludePostId ? this.toObjectId(excludePostId) : null;
    if (excluded) match._id = { $ne: excluded };
    const [result] = await this.connection
      .collection('posts')
      .aggregate(
        [
          { $match: match },
          { $unwind: '$mediaSizes' },
          {
            $group: {
              _id: null,
              total: { $sum: { $ifNull: ['$mediaSizes.sizeBytes', 0] } },
            },
          },
        ],
        { session },
      )
      .toArray();
    return Number(result?.total) || 0;
  }

  /** Total usado: blogs + anuncios. Es lo que se compara contra el cupo. */
  async getUsedBytes(userId: string, session?: ClientSession): Promise<number> {
    const [production, posts] = await Promise.all([
      this.getProductionBytes(userId, session),
      this.getPostMediaBytes(userId, session),
    ]);
    return production + posts;
  }

  /**
   * Lanza si sumar `extraBytes` pasa el cupo. `usedBytes` permite pasar un uso
   * ya calculado (ej. sin contar el anuncio que se está editando).
   */
  assertFits(
    limitBytes: number,
    usedBytes: number,
    extraBytes: number,
    what = 'Este archivo',
  ): void {
    if (extraBytes <= 0) return;
    if (usedBytes + extraBytes <= limitBytes) return;
    const available = Math.max(0, limitBytes - usedBytes);
    throw new BadRequestException(
      `No tenés espacio suficiente. Tu plan permite ${formatBytes(
        limitBytes,
      )} de almacenamiento (blogs y fotos y videos de anuncios) y te quedan ${formatBytes(
        available,
      )}. ${what} pesa ${formatBytes(extraBytes)}. Liberá espacio o mejorá tu plan.`,
    );
  }
}

/**
 * Pesos de las fotos y videos de un anuncio, alineados con sus `imagesUrls`:
 * conserva los que ya tenía (no se pueden reescribir), suma los nuevos que
 * informa el cliente y descarta los de keys que ya no están.
 */
export function mergePostMediaSizes(
  imagesUrls: string[] | undefined | null,
  previous: PostMediaSize[] | undefined | null,
  incoming: PostMediaSize[] | undefined | null,
): PostMediaSize[] {
  const keys = new Set(imagesUrls ?? []);
  const byKey = new Map<string, number>();
  const add = (entry: PostMediaSize, override: boolean) => {
    if (!entry?.key || !keys.has(entry.key)) return;
    if (!override && byKey.has(entry.key)) return;
    byKey.set(entry.key, Math.max(0, Math.floor(Number(entry.sizeBytes) || 0)));
  };
  (previous ?? []).forEach((entry) => add(entry, true));
  // Un archivo ya registrado conserva su peso: el cliente sólo informa nuevos.
  (incoming ?? []).forEach((entry) => add(entry, false));
  return Array.from(byKey, ([key, sizeBytes]) => ({ key, sizeBytes }));
}

export const sumMediaSizes = (sizes: PostMediaSize[]) =>
  sizes.reduce((total, entry) => total + entry.sizeBytes, 0);
