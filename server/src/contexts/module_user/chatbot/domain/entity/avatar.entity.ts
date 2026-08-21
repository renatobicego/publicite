import { ObjectId } from 'mongoose';

/**
 * Personaje de IA creado por un usuario. El `context` se inyecta en el system
 * prompt como preferencia de tono/enfoque (mismo tratamiento que `rolePrompt`).
 */
export class Avatar {
  private _id?: ObjectId | string;
  private userId: string;
  private name: string;
  private context: string;
  private seed: string;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(
    userId: string,
    name: string,
    context: string,
    seed: string,
    _id?: ObjectId | string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.userId = userId;
    this.name = name;
    this.context = context;
    this.seed = seed;
    this._id = _id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get getId(): ObjectId | string | undefined {
    return this._id;
  }

  get getUserId(): string {
    return this.userId;
  }

  get getName(): string {
    return this.name;
  }

  get getContext(): string {
    return this.context;
  }

  get getSeed(): string {
    return this.seed;
  }

  get getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  get getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  /** El avatar sólo lo puede usar/editar su dueño. */
  belongsTo(userId?: string): boolean {
    return !!userId && this.userId === userId;
  }
}
