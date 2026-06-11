export interface Giveaway {
  _id: string;
  participants: string[]; // array de user IDs
  winner: GiveawayWinner | null;
}

export interface GiveawayWinner {
  _id: string;
  username: string;
  profilePhotoUrl: string;
}
