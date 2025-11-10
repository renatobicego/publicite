import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ChatMessage } from './chat.message.entity';

@ObjectType()
export class ChatSession {
  @Field(() => ID, { nullable: true })
  private _id?: ObjectId;

  @Field(() => String)
  private sessionId: string;

  @Field(() => String, { nullable: true })
  private userId?: string;

  @Field(() => [String])
  private messages: ChatMessage[];

  @Field(() => Date)
  private createdAt: Date;

  @Field(() => Date)
  private updatedAt: Date;

  @Field(() => Boolean)
  private isActive: boolean;

  constructor(
    sessionId: string,
    messages: ChatMessage[],
    createdAt: Date,
    updatedAt: Date,
    isActive: boolean,
    userId?: string,
    _id?: ObjectId,
  ) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.messages = messages;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
    this._id = _id;
  }

  get getId(): ObjectId | undefined {
    return this._id;
  }

  get getSessionId(): string {
    return this.sessionId;
  }

  get getUserId(): string | undefined {
    return this.userId;
  }

  get getMessages(): ChatMessage[] {
    return this.messages;
  }

  get getCreatedAt(): Date {
    return this.createdAt;
  }

  get getUpdatedAt(): Date {
    return this.updatedAt;
  }

  get getIsActive(): boolean {
    return this.isActive;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
  }
}

