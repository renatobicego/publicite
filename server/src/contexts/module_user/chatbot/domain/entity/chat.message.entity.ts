import { Field, ObjectType } from '@nestjs/graphql';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@ObjectType()
export class ChatMessage {
  @Field(() => String)
  private role: MessageRole;

  @Field(() => String)
  private content: string;

  @Field(() => Date)
  private timestamp: Date;

  constructor(role: MessageRole, content: string, timestamp: Date) {
    this.role = role;
    this.content = content;
    this.timestamp = timestamp;
  }

  get getRole(): MessageRole {
    return this.role;
  }

  get getContent(): string {
    return this.content;
  }

  get getTimestamp(): Date {
    return this.timestamp;
  }
}

