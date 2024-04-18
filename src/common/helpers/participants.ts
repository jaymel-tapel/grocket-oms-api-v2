import { AppEnum } from '@modules/chats/dto/sender.dto';

export const determineEmailKey = (
  appType: AppEnum,
): 'user_email' | 'client_email' => {
  return appType === 'OMS' ? 'user_email' : 'client_email';
};

export const determineModelName = (appType: AppEnum): 'user' | 'client' => {
  return appType === 'OMS' ? 'user' : 'client';
};
