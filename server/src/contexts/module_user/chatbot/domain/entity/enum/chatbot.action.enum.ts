import { registerEnumType } from '@nestjs/graphql';

export enum ChatbotAction {
  CREATE_AD = 'CREATE_AD',
}

registerEnumType(ChatbotAction, {
  name: 'ChatbotAction',
  description:
    'Acciones que el chatbot puede señalizar al FE cuando detecta una intención del usuario',
});
