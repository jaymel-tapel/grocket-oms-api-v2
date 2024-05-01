import { UserOrClientType } from '../types/UserOrClient.type';

export interface IActiveUser {
  type: UserOrClientType;
  email: string;
  socketId: string;
  isActive: boolean;
}
