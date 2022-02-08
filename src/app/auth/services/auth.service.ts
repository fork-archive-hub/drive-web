import { aes } from '@internxt/lib';
import {
  CryptoProvider,
  Keys,
  LoginDetails,
  Password,
  SecurityDetails, TwoFactorAuthQR,
  UserAccessError
} from '@internxt/sdk/dist/auth';
import {
  decryptText,
  decryptTextWithKey,
  encryptText,
  encryptTextWithKey,
  passToHash,
} from 'app/crypto/services/utils';
import i18n from 'app/i18n/services/i18n.service';
import databaseService from 'app/database/services/database.service';
import notificationsService, { ToastType } from 'app/notifications/services/notifications.service';
import navigationService from 'app/core/services/navigation.service';
import localStorageService from 'app/core/services/local-storage.service';
import analyticsService from 'app/analytics/services/analytics.service';
import { getAesInitFromEnv, validateFormat } from 'app/crypto/services/keys.service';
import { AppView } from 'app/core/types';
import { generateNewKeys } from 'app/crypto/services/pgp.service';
import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import { SdkFactory } from '../../core/factory/sdk';
import { ChangePasswordPayload } from '@internxt/sdk/dist/drive/users/types';

export async function logOut(): Promise<void> {
  analyticsService.trackSignOut();
  await (await databaseService).clear();
  localStorageService.clear();
  navigationService.push(AppView.Login);
}

export function cancelAccount(): Promise<void> {
  const email = localStorageService.getUser()?.email;
  const authClient = SdkFactory.getInstance().createAuthClient();
  return authClient.sendDeactivationEmail(<string>email)
    .then(() => {
      notificationsService.show(i18n.get('success.accountDeactivationEmailSent'), ToastType.Info);
    })
    .catch(() => {
      notificationsService.show(i18n.get('error.deactivatingAccount'), ToastType.Warning);
    });
}

export const is2FANeeded = async (email: string): Promise<boolean> => {
  const authClient = SdkFactory.getInstance().createAuthClient();
  const securityDetails = await authClient.securityDetails(email)
    .catch(error => {
      analyticsService.signInAttempted(email, error.message);
      throw new Error(error.message ?? 'Login error');
    });

  return securityDetails.tfaEnabled;
};

const generateNewKeysWithEncrypted = async (password: string) => {
  const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await generateNewKeys();

  return {
    privateKeyArmored,
    privateKeyArmoredEncrypted: aes.encrypt(privateKeyArmored, password, getAesInitFromEnv()),
    publicKeyArmored,
    revocationCertificate,
  };
};

export const doLogin = async (email: string, password: string, twoFactorCode: string): Promise<{
  user: UserSettings
  token: string;
}> => {
  const authClient = SdkFactory.getInstance().createAuthClient();
  const loginDetails: LoginDetails = {
    email: email,
    password: password,
    tfaCode: twoFactorCode
  };
  const cryptoProvider: CryptoProvider = {
    encryptPasswordHash(password: Password, encryptedSalt: string): string {
      const salt = decryptText(encryptedSalt);
      const hashObj = passToHash({ password, salt });
      return encryptText(hashObj.hash);
    },
    async generateKeys(password: Password): Promise<Keys> {
      const {
        privateKeyArmoredEncrypted,
        publicKeyArmored,
        revocationCertificate,
      } = await generateNewKeysWithEncrypted(password);
      const keys: Keys = {
        privateKeyEncrypted: privateKeyArmoredEncrypted,
        publicKey: publicKeyArmored,
        revocationCertificate: revocationCertificate
      };
      return Promise.resolve(keys);
    }
  };

  return authClient.login(loginDetails, cryptoProvider)
    .then(async data => {
      const user = data.user;
      const token = data.token;

      const publicKey = user.publicKey;
      const privateKey = user.privateKey;
      const revocationCertificate = user.revocationKey;

      const { update, privkeyDecrypted, newPrivKey } = await validateFormat(privateKey, password);
      const newKeys: Keys = {
        privateKeyEncrypted: newPrivKey,
        publicKey: publicKey,
        revocationCertificate: revocationCertificate
      };
      if (update) {
        await authClient.updateKeys(newKeys, token);
      }

      const clearMnemonic = decryptTextWithKey(user.mnemonic, password);
      const clearPrivateKeyBase64 = Buffer.from(privkeyDecrypted).toString('base64');

      const clearUser = {
        ...user,
        mnemonic: clearMnemonic,
        privateKey: clearPrivateKeyBase64,
      };

      localStorageService.set('xToken', token);
      localStorageService.set('xMnemonic', clearMnemonic);

      return {
        user: clearUser,
        token: token
      };
    })
    .catch(error => {
      if (error instanceof UserAccessError) {
        analyticsService.signInAttempted(email, error.message);
      }
      throw error;
    });
};

export const readReferalCookie = (): string | undefined => {
  const cookie = document.cookie.match(/(^| )REFERRAL=([^;]+)/);

  return cookie ? cookie[2] : undefined;
};

export const getSalt = async (): Promise<string> => {
  const email = localStorageService.getUser()?.email;
  const authClient = SdkFactory.getInstance().createAuthClient();
  const securityDetails = await authClient.securityDetails(String(email));
  return decryptText(securityDetails.encryptedSalt);
};

export const getPasswordDetails = async (
  currentPassword: string,
): Promise<{ salt: string; hashedCurrentPassword: string; encryptedCurrentPassword: string }> => {
  const salt = await getSalt();
  if (!salt) {
    throw new Error('Internal server error. Please reload.');
  }

  // Encrypt  the password
  const hashedCurrentPassword = passToHash({ password: currentPassword, salt }).hash;
  const encryptedCurrentPassword = encryptText(hashedCurrentPassword);

  return { salt, hashedCurrentPassword, encryptedCurrentPassword };
};

export const changePassword = async (newPassword: string, currentPassword: string, email: string): Promise<void> => {
  const user = localStorageService.getUser() as UserSettings;

  const { encryptedCurrentPassword } = await getPasswordDetails(currentPassword);

  // Encrypt the new password
  const hashedNewPassword = passToHash({ password: newPassword });
  const encryptedNewPassword = encryptText(hashedNewPassword.hash);
  const encryptedNewSalt = encryptText(hashedNewPassword.salt);

  // Encrypt the mnemonic
  const encryptedMnemonic = encryptTextWithKey(user.mnemonic, newPassword);
  const privateKey = Buffer.from(user.privateKey, 'base64').toString();
  const privateKeyEncrypted = aes.encrypt(privateKey, newPassword, getAesInitFromEnv());

  const usersClient = SdkFactory.getInstance().createUsersClient();

  return usersClient.changePassword(<ChangePasswordPayload>{
    currentEncryptedPassword: encryptedCurrentPassword,
    newEncryptedPassword: encryptedNewPassword,
    newEncryptedSalt: encryptedNewSalt,
    encryptedMnemonic: encryptedMnemonic,
    encryptedPrivateKey: privateKeyEncrypted,
  })
    .then(() => {
      analyticsService.track(email, 'success');
    })
    .catch(error => {
      analyticsService.track(email, 'error');
      if (error.status === 500) {
        throw new Error('The password you introduced does not match your current password');
      }
      throw error;
    });
};

export const userHas2FAStored = (): Promise<SecurityDetails> => {
  const email = localStorageService.getUser()?.email;
  const authClient = SdkFactory.getInstance().createAuthClient();
  return authClient.securityDetails(<string>email);
};

export const generateNew2FA = (): Promise<TwoFactorAuthQR> => {
  const authClient = SdkFactory.getInstance().createAuthClient();
  return authClient.generateTwoFactorAuthQR();
};

export const deactivate2FA = (
  passwordSalt: string,
  deactivationPassword: string,
  deactivationCode: string,
): Promise<void> => {
  const salt = decryptText(passwordSalt);
  const hashObj = passToHash({ password: deactivationPassword, salt });
  const encPass = encryptText(hashObj.hash);
  const authClient = SdkFactory.getInstance().createAuthClient();
  return authClient.disableTwoFactorAuth(encPass, deactivationCode);
};

const store2FA = async (code: string, twoFactorCode: string): Promise<void> => {
  const authClient = SdkFactory.getInstance().createAuthClient();
  return authClient.storeTwoFactorAuthKey(code, twoFactorCode);
};

const authService = {
  logOut,
  doLogin,
  check2FANeeded: is2FANeeded,
  readReferalCookie,
  cancelAccount,
  store2FA,
};

export default authService;
