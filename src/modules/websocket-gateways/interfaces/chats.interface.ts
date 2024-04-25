import { MessageEntity } from '@modules/messages/entities/message.entity';

export interface IServerToClientEvents {
  getOnlineUsers: (payload: string[]) => void;
  onMessage: (payload: MessageEntity) => void;
}
