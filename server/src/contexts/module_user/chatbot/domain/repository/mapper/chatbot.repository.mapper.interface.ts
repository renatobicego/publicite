import { ChatSession } from '../../entity/chat.session.entity';

export interface ChatbotRepositoryMapperInterface {
  documentToEntity(document: any): ChatSession;
  entityToDocument(entity: ChatSession): any;
}

