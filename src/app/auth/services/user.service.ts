import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import { SdkFactory } from '../../core/factory/sdk';
import { InitializeUserResponse } from '@internxt/sdk/dist/drive/users/types';

export async function initializeUser(email: string, mnemonic: string): Promise<InitializeUserResponse> {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.initialize(email, mnemonic);
}

export const sendDeactivationEmail = (email: string): Promise<void> => {
  const authClient = SdkFactory.getInstance().createAuthClient();
  return authClient.sendDeactivationEmail(email);
};

const inviteAFriend = (email: string): Promise<void> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.sendInvitation(email);
};

/**
 * ! This endpoint accepts a body but is using GET method
 */
const refreshUser = async (): Promise<{ user: UserSettings; token: string }> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.refreshUser();
};

const userService = {
  initializeUser,
  refreshUser,
  sendDeactivationEmail,
  inviteAFriend,
};

export default userService;
