import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChatMessageResponse {
  @Field(() => String)
  role: string;

  @Field(() => String)
  content: string;

  @Field(() => Date)
  timestamp: Date;
}

@ObjectType()
export class ChatSessionResponse {
  @Field(() => String)
  sessionId: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => [ChatMessageResponse])
  messages: ChatMessageResponse[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean)
  isActive: boolean;
}

@ObjectType()
export class SendMessageResponse {
  @Field(() => String)
  sessionId: string;

  @Field(() => String)
  userMessage: string;

  @Field(() => String)
  botResponse: string;

  @Field(() => Date)
  timestamp: Date;
}

@ObjectType()
export class GetSessionHistoryResponse {
  @Field(() => String)
  sessionId: string;

  @Field(() => [ChatMessageResponse])
  messages: ChatMessageResponse[];

  @Field(() => Number)
  totalMessages: number;
}

