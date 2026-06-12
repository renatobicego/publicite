import { Document, model, Schema } from 'mongoose';

export interface GiveawayWinnerDocument {
  userId: string; // clerkId del ganador
  username: string;
  profilePhotoUrl?: string | null;
}

export interface GiveawayDocument extends Document {
  _id: string; // id custom del sorteo (ej: "sorteo-lentes-afa-2026")
  participants: string[]; // clerkIds de los participantes
  winner?: GiveawayWinnerDocument | null;
  createdAt: Date;
  updatedAt: Date;
}

const GiveawayWinnerSchema = new Schema<GiveawayWinnerDocument>(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    profilePhotoUrl: { type: String, default: null },
  },
  { _id: false },
);

const GiveawaySchema = new Schema<GiveawayDocument>(
  {
    // _id custom (string) en vez del ObjectId autogenerado: el front lo fija
    // (ej: "sorteo-lentes-afa-2026").
    _id: { type: String, required: true },
    participants: {
      type: [String],
      required: true,
      default: [],
    },
    winner: {
      type: GiveawayWinnerSchema,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'giveaways',
  },
);

const GiveawayModel = model<GiveawayDocument>('Giveaway', GiveawaySchema);

export { GiveawaySchema, GiveawayModel };
