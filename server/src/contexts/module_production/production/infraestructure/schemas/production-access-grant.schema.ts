import { Document, model, Schema, Types } from 'mongoose';

export interface ProductionAccessGrantDocument extends Document {
  production: Types.ObjectId;
  user: Types.ObjectId;
  /** Versión de la clave con la que se otorgó; si la clave cambia, caduca. */
  keyVersion: number | null;
  grantedAt: Date | null;
  failedAttempts: number;
  lockedUntil: Date | null;
}

/**
 * Acceso por clave (INV-01/02): registra qué usuario ya ingresó la clave de un
 * blog y lleva la cuenta de intentos fallidos para frenar la fuerza bruta.
 */
export const ProductionAccessGrantSchema =
  new Schema<ProductionAccessGrantDocument>(
    {
      production: {
        type: Schema.Types.ObjectId,
        ref: 'Production',
        required: true,
      },
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      keyVersion: { type: Number, default: null },
      grantedAt: { type: Date, default: null },
      failedAttempts: { type: Number, default: 0 },
      lockedUntil: { type: Date, default: null },
    },
    { collection: 'productionaccessgrants', timestamps: true },
  );

ProductionAccessGrantSchema.index({ production: 1, user: 1 }, { unique: true });

const ProductionAccessGrantModel = model<ProductionAccessGrantDocument>(
  'ProductionAccessGrant',
  ProductionAccessGrantSchema,
);

export default ProductionAccessGrantModel;
