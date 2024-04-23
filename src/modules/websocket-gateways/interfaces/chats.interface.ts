import { ClientEntity } from '@modules/clients/entities/client.entity';
import { ConversationEntity } from '@modules/conversations/entities/conversation.entity';
import { MessageEntity } from '@modules/messages/entities/message.entity';
import { UserEntity } from '@modules/users/entities/user.entity';

export interface IServerToClientEvents {
  getOnlineUsers: (payload: UserEntity | ClientEntity) => void;
  onMessage: (payload: MessageEntity) => void;
  joinRoom: (payload: { message: string }) => void;
  chatHistory: (payload: MessageEntity[]) => void;
  getConversations: (payload: ConversationEntity[]) => void;
}
