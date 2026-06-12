import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GiveawayWinnerResponse {
  @Field(() => String)
  _id: string; // clerkId del ganador

  @Field(() => String)
  username: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl?: string | null;

  constructor(winner: any) {
    this._id = (winner?.userId ?? winner?._id)?.toString();
    this.username = winner?.username;
    this.profilePhotoUrl = winner?.profilePhotoUrl ?? null;
  }
}

@ObjectType()
export class GiveawayResponse {
  @Field(() => String)
  _id: string;

  @Field(() => [String], { nullable: false })
  participants: string[];

  @Field(() => GiveawayWinnerResponse, { nullable: true })
  winner?: GiveawayWinnerResponse | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  constructor(document: any) {
    this._id = document._id?.toString();
    this.participants = Array.isArray(document.participants)
      ? document.participants.map((participant: any) => participant?.toString())
      : [];
    this.winner = document.winner
      ? new GiveawayWinnerResponse(document.winner)
      : null;
    this.createdAt = document.createdAt;
    this.updatedAt = document.updatedAt;
  }
}
