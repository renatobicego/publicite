import { Schema, Document } from 'mongoose';
import { ChatbotAction } from '../../domain/entity/enum/chatbot.action.enum';

export interface ChatMessageDocument {
  role: string;
  content: string;
  timestamp: Date;
  action?: string;
}

export interface ChatSessionDocument extends Document {
  sessionId: string;
  userId?: string;
  messages: ChatMessageDocument[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const ChatMessageSchema = new Schema(
  {
    role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    action: { type: String, required: false, enum: Object.values(ChatbotAction) },
  },
  { _id: false },
);

export const ChatSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    messages: { type: [ChatMessageSchema], default: [] },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    isActive: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

ChatSessionSchema.index({ sessionId: 1 });
ChatSessionSchema.index({ userId: 1, createdAt: -1 });
ChatSessionSchema.index({ isActive: 1 });
