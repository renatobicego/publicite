# Historial de Chats - Documentación de la Feature

## Queries/Mutations GraphQL disponibles

### 1. `getUserChatSessions` (Query) ✅ IMPLEMENTADA
Lista todas las sesiones de chat de un usuario.

```graphql
query GetUserChatSessions($userId: String!, $limit: Float, $page: Float) {
  getUserChatSessions(userId: $userId, limit: $limit, page: $page) {
    sessions {
      sessionId
      title           # Primeros 50 chars del primer mensaje del usuario
      lastMessage     # Últimos 100 chars del último mensaje
      lastMessageAt   # Timestamp del último update
      messageCount    # Total de mensajes
      createdAt
    }
    totalCount
    hasMore
  }
}
```

### 2. `getChatSessionHistory` (Query) ✅ YA EXISTÍA
Obtiene los mensajes de una sesión específica.

```graphql
query GetChatSessionHistory($sessionId: String!, $limit: Float, $page: Float) {
  getChatSessionHistory(sessionId: $sessionId, limit: $limit, page: $page) {
    sessionId
    messages {
      role
      content
      timestamp
      action
    }
    totalMessages
  }
}
```

### 3. `deleteChatSession` (Mutation) ✅ YA EXISTÍA
Elimina una sesión completa y todos sus mensajes.

```graphql
mutation DeleteChatSession($sessionId: String!) {
  deleteChatSession(sessionId: $sessionId)
}
```

## Archivos modificados

### Backend (server)
- `application/dto/HTTP-RESPONSE/chatbot.response.ts` - Tipos `ChatSessionSummary` y `GetUserChatSessionsResponse`
- `domain/service/chatbot.service.interface.ts` - Agregado `getUserChatSessions`
- `application/adapter/chatbot.adapter.interface.ts` - Agregado `getUserChatSessions`
- `application/service/chatbot.service.ts` - Implementación de `getUserChatSessions`
- `infrastructure/adapter/chatbot.adapter.ts` - Delegación al service
- `infrastructure/graphql/resolver/chatbot.resolver.ts` - Query expuesta

### Frontend (client)
- `src/graphql/chatBotQueries.ts` - Queries GraphQL
- `src/services/chatbotServices.ts` - Servicios para consumir las queries
- `src/types/chatbotTypes.d.ts` - Types del historial
- `src/components/buttons/ChatbotButton/useChatbot.ts` - Hook con toda la lógica
- `src/components/buttons/ChatbotButton/ChatHistory.tsx` - Componente UI del historial
- `src/components/buttons/ChatbotButton/ChatWindow.tsx` - Widget flotante con historial
- `src/components/buttons/ChatbotButton/Chatbot.tsx` - Integración del historial
- `src/app/(root)/cubito/CubitoChat.tsx` - Página full con historial

## Notas
- El `userId` que se usa es el `clerkId` del usuario autenticado
- Las sesiones se ordenan por `createdAt` descendente
- Solo se muestran sesiones con al menos 1 mensaje
- El título se genera automáticamente del primer mensaje del usuario (max 50 chars)
