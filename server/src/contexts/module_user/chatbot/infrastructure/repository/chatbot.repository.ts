import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatbotRepositoryInterface } from '../../domain/repository/chatbot.repository.interface';
import { ChatSession } from '../../domain/entity/chat.session.entity';
import { ChatMessage } from '../../domain/entity/chat.message.entity';
import { ChatSessionDocument } from '../schemas/chatbot.schema';
import { MessageRole } from '../../domain/entity/enum/message.role.enum';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

@Injectable()
export class ChatbotRepository implements ChatbotRepositoryInterface {
  constructor(
    @InjectModel('ChatSession')
    private readonly chatSessionModel: Model<ChatSessionDocument>,
    private readonly logger: MyLoggerService,
  ) {}

  async createSession(session: ChatSession): Promise<ChatSession> {
    try {
      const sessionDoc = new this.chatSessionModel({
        sessionId: session.getSessionId,
        userId: session.getUserId,
        messages: session.getMessages.map((msg) => ({
          role: msg.getRole,
          content: msg.getContent,
          timestamp: msg.getTimestamp,
        })),
        createdAt: session.getCreatedAt,
        updatedAt: session.getUpdatedAt,
        isActive: session.getIsActive,
      });

      const savedSession = await sessionDoc.save();
      return this.documentToEntity(savedSession);
    } catch (error: any) {
      this.logger.error('Error creating chat session: ' + error.message);
      throw error;
    }
  }

  async findSessionById(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessionDoc = await this.chatSessionModel.findOne({ sessionId }).exec();
      
      if (!sessionDoc) {
        return null;
      }

      return this.documentToEntity(sessionDoc);
    } catch (error: any) {
      this.logger.error('Error finding chat session: ' + error.message);
      throw error;
    }
  }

  async updateSession(
    sessionId: string,
    messages: ChatMessage[],
  ): Promise<ChatSession | null> {
    try {
      const updatedSession = await this.chatSessionModel
        .findOneAndUpdate(
          { sessionId },
          {
            messages: messages.map((msg) => ({
              role: msg.getRole,
              content: msg.getContent,
              timestamp: msg.getTimestamp,
            })),
            updatedAt: new Date(),
          },
          { new: true },
        )
        .exec();

      if (!updatedSession) {
        return null;
      }

      return this.documentToEntity(updatedSession);
    } catch (error: any) {
      this.logger.error('Error updating chat session: ' + error.message);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const result = await this.chatSessionModel.deleteOne({ sessionId }).exec();
      return result.deletedCount > 0;
    } catch (error: any) {
      this.logger.error('Error deleting chat session: ' + error.message);
      throw error;
    }
  }

  async findSessionsByUserId(
    userId: string,
    limit: number,
    page: number,
  ): Promise<ChatSession[]> {
    try {
      const skip = (page - 1) * limit;
      
      const sessions = await this.chatSessionModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return sessions.map((session) => this.documentToEntity(session));
    } catch (error: any) {
      this.logger.error('Error finding user sessions: ' + error.message);
      throw error;
    }
  }

  async deactivateSession(sessionId: string): Promise<boolean> {
    try {
      const result = await this.chatSessionModel
        .updateOne({ sessionId }, { isActive: false })
        .exec();
      
      return result.modifiedCount > 0;
    } catch (error: any) {
      this.logger.error('Error deactivating chat session: ' + error.message);
      throw error;
    }
  }

  private documentToEntity(doc: ChatSessionDocument): ChatSession {
    const messages = doc.messages.map(
      (msg) =>
        new ChatMessage(
          msg.role as MessageRole,
          msg.content,
          msg.timestamp,
        ),
    );

    return new ChatSession(
      doc.sessionId,
      messages,
      doc.createdAt,
      doc.updatedAt,
      doc.isActive,
      doc.userId,
      doc._id as any,
    );
  }
}

