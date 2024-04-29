import { MessageEntity } from '@modules/messages/entities/message.entity';

export interface IServerToClientEvents {
  getOnlineUsers: (payload: { email: string; isActive: boolean }) => void;
  onMessage: (payload: MessageEntity) => void;
}
