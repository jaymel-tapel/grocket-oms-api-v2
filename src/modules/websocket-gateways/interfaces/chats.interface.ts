import { ConversationEntity } from '@modules/conversations/entities/conversation.entity';
import { MessageEntity } from '@modules/messages/entities/message.entity';

export interface IServerToClientEvents {
  onMessage: (payload: MessageEntity) => void;
  joinRoom: (payload: { message: string }) => void;
  chatHistory: (payload: MessageEntity[]) => void;
  getConversations: (payload: ConversationEntity[]) => void;
}
