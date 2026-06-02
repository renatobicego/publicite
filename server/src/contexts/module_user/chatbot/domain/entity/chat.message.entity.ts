import { Field, ObjectType } from '@nestjs/graphql';
import { ChatbotAction } from './enum/chatbot.action.enum';

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

  @Field(() => ChatbotAction, { nullable: true })
  private action?: ChatbotAction;

  constructor(
    role: MessageRole,
    content: string,
    timestamp: Date,
    action?: ChatbotAction,
  ) {
    this.role = role;
    this.content = content;
    this.timestamp = timestamp;
    this.action = action;
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

  get getAction(): ChatbotAction | undefined {
    return this.action;
  }
}
