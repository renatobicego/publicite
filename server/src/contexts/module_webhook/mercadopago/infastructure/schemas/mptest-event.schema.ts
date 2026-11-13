import { Schema } from 'mongoose';

/*
Eventos de MercadoPago de las pruebas de la Fase 0 (`external_reference`
`mptest:<uuid>`). El webhook los guarda tal cual y responde OK, sin tocar
usuarios ni límites. Sirven para ver qué manda MP con una suscripción sin plan
o un pago único: orden de los eventos, estados, si llega la referencia.
*/
export const MpTestEventSchema = new Schema(
  {
    topic: { type: String },
    action: { type: String },
    dataId: { type: String },
    externalReference: { type: String },
    status: { type: String },
    amount: { type: Number },
    payload: { type: Schema.Types.Mixed },
    receivedAt: { type: Date, default: Date.now },
  },
  { collection: 'mptestevents' },
);

MpTestEventSchema.index({ receivedAt: -1 });

export interface MpTestEventDocument {
  _id: any;
  topic?: string;
  action?: string;
  dataId?: string;
  externalReference?: string;
  status?: string;
  amount?: number;
  payload?: any;
  receivedAt: Date;
}
