import { Document, model, Schema, Types } from 'mongoose';

export interface ProductionTicketDocument extends Document {
  production: Types.ObjectId;
  /** Carpeta o archivo al que aplica; null = todo el blog (TKT-01). */
  target: Types.ObjectId | null;
  isPaid: boolean;
  price: number;
  currency: string;
  durationHours: number | null;
  untilClose: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ticket de acceso (Page de Ticket, TKT-01..03). Los hijos de la carpeta a la
 * que se asigna lo heredan, salvo que tengan un ticket propio.
 */
export const ProductionTicketSchema = new Schema<ProductionTicketDocument>(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: 'Production',
      required: true,
    },
    target: {
      type: Schema.Types.ObjectId,
      ref: 'ProductionItem',
      default: null,
    },
    isPaid: { type: Boolean, required: true },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'ARS' },
    durationHours: { type: Number, default: null },
    untilClose: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { collection: 'productiontickets', timestamps: true },
);

// Un único ticket por destino dentro del blog.
ProductionTicketSchema.index(
  { production: 1, target: 1 },
  { unique: true, name: 'unique_ticket_per_target' },
);

const ProductionTicketModel = model<ProductionTicketDocument>(
  'ProductionTicket',
  ProductionTicketSchema,
);

export default ProductionTicketModel;
