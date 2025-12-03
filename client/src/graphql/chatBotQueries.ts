import gql from "graphql-tag";

export const createChatSessionMutation = gql`
  mutation CreateChatSession($createSessionRequest: CreateSessionRequest) {
    createChatSession(createSessionRequest: $createSessionRequest) {
      messages {
        content
        role
        timestamp
      }
      sessionId
    }
  }
`;

export const sendMessageMutation = gql`
  mutation SendMessageToChatbot($sendMessageRequest: SendMessageRequest!) {
    sendMessageToChatbot(sendMessageRequest: $sendMessageRequest) {
      botResponse
      sessionId
      timestamp
      userMessage
    }
  }
`;
