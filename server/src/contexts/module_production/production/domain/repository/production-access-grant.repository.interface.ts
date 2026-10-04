import { ClientSession } from 'mongoose';

export interface ProductionAccessGrantState {
  keyVersion: number | null;
  failedAttempts: number;
  lockedUntil: Date | null;
}

export interface ProductionAccessGrantRepositoryInterface {
  find(
    productionId: string,
    userId: string,
  ): Promise<ProductionAccessGrantState | null>;
  /** Otorga el acceso para la versión actual de la clave y limpia intentos. */
  grant(productionId: string, userId: string, keyVersion: number): Promise<void>;
  /**
   * Suma un intento fallido; si llega al máximo, bloquea hasta `lockUntil` y
   * reinicia el contador.
   */
  registerFailure(
    productionId: string,
    userId: string,
    maxAttempts: number,
    lockUntil: Date,
  ): Promise<ProductionAccessGrantState>;
  deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void>;
}
