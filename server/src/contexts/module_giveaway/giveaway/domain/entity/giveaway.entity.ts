export interface GiveawayWinnerEntity {
  userId: string; // clerkId del usuario ganador
  username: string;
  profilePhotoUrl?: string | null;
}

export class GiveawayEntity {
  readonly _id?: string;
  readonly participants: string[];
  readonly winner?: GiveawayWinnerEntity | null;

  constructor(params: {
    _id?: string;
    participants: string[];
    winner?: GiveawayWinnerEntity | null;
  }) {
    this._id = params._id;
    this.participants = params.participants;
    this.winner = params.winner ?? null;
  }
}
