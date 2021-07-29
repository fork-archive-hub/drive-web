import { useState } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import * as bip39 from 'bip39';
import queryString from 'query-string';

import SideInfo from '../Authentication/SideInfo';
import { IFormValues, UserSettings } from '../../models/interfaces';
import localStorageService from '../../services/localStorage.service';
import { emailRegexPattern, validateEmail } from '../../services/validation.service';
import analyticsService from '../../services/analytics.service';
import { initializeUser, readReferalCookie } from '../../services/auth.service';
import AuthInput from '../../components/Inputs/AuthInput';
import CheckboxPrimary from '../../components/Checkboxes/CheckboxPrimary';
import AuthButton from '../../components/Buttons/AuthButton';
import { useAppDispatch } from '../../store/hooks';
import { decryptTextWithKey, encryptText, encryptTextWithKey, passToHash } from '../../lib/utils';
import { setUser } from '../../store/slices/user';
import { getHeaders } from '../../lib/auth';
import AesUtils from '../../lib/AesUtil';
import { generateNewKeys } from '../../services/pgp.service';
import history from '../../lib/history';
import BaseButton from '../../components/Buttons/BaseButton';
import { texts } from '../SignInView/SignInView';

interface SignUpProps {
  match: any;
  location: {
    search: string;
  };
  isNewUser: boolean;
}

const SignUp = (props: SignUpProps): JSX.Element => {
  const { register, formState: { errors, isValid }, handleSubmit, control } = useForm<IFormValues>({ mode: 'onChange' });
  const dispatch = useAppDispatch();

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword', defaultValue: '' });
  const [referrer, setReferrer] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [signupError, setSignupError] = useState<Error | string>();
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const qs = queryString.parse(history.location.search);
  const hasEmailParam = props.match.params.email && validateEmail(props.match.params.email);
  const hasTokenParam = qs.token;
  const hasReferrerParam = (qs.referrer && qs.referrer.toString()) || undefined;

  if (hasTokenParam && typeof hasTokenParam === 'string') {
    localStorageService.clear();
    localStorageService.set('xToken', hasTokenParam);
    history.replace(history.location.pathname);
  }

  const updateInfo = (name: string, lastname: string, email: string, password: string) => {
    // Setup hash and salt
    const hashObj = passToHash({ password: password });
    const encPass = encryptText(hashObj.hash);
    const encSalt = encryptText(hashObj.salt);

    // Setup mnemonic
    const mnemonic = bip39.generateMnemonic(256);
    const encMnemonic = encryptTextWithKey(mnemonic, password);

    // Body
    const body = {
      name: name,
      lastname: lastname,
      email: email,
      password: encPass,
      mnemonic: encMnemonic,
      salt: encSalt,
      referral: readReferalCookie()
    };

    const fetchHandler = async (res: Response) => {
      const body = await res.text();

      try {
        const bodyJson = JSON.parse(body);

        return { res: res, body: bodyJson };
      } catch {
        return { res: res, body: body };
      }
    };

    return fetch('/api/appsumo/update', {
      method: 'POST',
      headers: getHeaders(true, false),
      body: JSON.stringify(body)
    }).then(fetchHandler).then(({ res, body }) => {
      if (res.status !== 200) {
        throw Error(body.error || 'Internal Server Error');
      } else {
        return body;
      }
    }).then(res => {
      const xToken = res.token;
      const xUser = res.user;

      xUser.mnemonic = mnemonic;

      return initializeUser(email, xUser.mnemonic).then((rootFolderInfo) => {
        xUser.root_folder_id = rootFolderInfo.user.root_folder_id;
        localStorageService.set('xToken', xToken);
        localStorageService.set('xMnemonic', mnemonic);
        dispatch(setUser(xUser));
      });
    });
  };

  const doRegister = async (name: string, lastname: string, email: string, password: string) => {
    // Setup hash and salt
    const hashObj = passToHash({ password: password });
    const encPass = encryptText(hashObj.hash);
    const encSalt = encryptText(hashObj.salt);
    // Setup mnemonic
    const mnemonic = bip39.generateMnemonic(256);
    const encMnemonic = encryptTextWithKey(mnemonic, password);

    //Generate keys
    const { privateKeyArmored, publicKeyArmored: codpublicKey, revocationCertificate: codrevocationKey } = await generateNewKeys();

    //Datas
    const encPrivateKey = AesUtils.encrypt(privateKeyArmored, password, false);

    return fetch('/api/register', {
      method: 'post',
      headers: getHeaders(true, true),
      body: JSON.stringify({
        name: name,
        lastname: lastname,
        email: email,
        password: encPass,
        mnemonic: encMnemonic,
        salt: encSalt,
        referral: readReferalCookie(),
        privateKey: encPrivateKey,
        publicKey: codpublicKey,
        revocationKey: codrevocationKey,
        referrer: referrer
      })
    }).then(response => {
      if (response.status === 200) {
        return response.json().then((body) => {
          // Manage succesfull register
          const { token, uuid } = body;
          const user: UserSettings = body.user;

          window.analytics.identify(uuid, { email: email, member_tier: 'free' });
          analyticsService.trackSignUp({
            properties: {
              userId: uuid,
              email: email
            }
          });

          localStorageService.set('xToken', token);
          user.mnemonic = decryptTextWithKey(user.mnemonic, password);
          dispatch(setUser({ ...user }));
          localStorageService.set('xMnemonic', user.mnemonic);

          return initializeUser(email, user.mnemonic).then((rootFolderInfo) => {
            user.root_folder_id = rootFolderInfo.user.root_folder_id;
            user.bucket = rootFolderInfo.user.bucket;
            dispatch(setUser({ ...user }));
            history.push('/login');
          });
        });

      } else {
        return response.json().then((body) => {
          if (body.error) {
            throw new Error(body.error);
          } else {
            throw new Error('Internal Server Error');
          }
        });
      }
    }).catch(err => {
      console.error('Register error', err);
      setSignupError(err.message || err);
      setShowError(true);
    });
  };

  const onSubmit: SubmitHandler<IFormValues> = async formData => {
    setIsLoading(true);
    try {
      const { name, lastname, email, password, confirmPassword } = formData;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!props.isNewUser) {
        await updateInfo(name, lastname, email, password).then(() => {
          history.push('/login');
        }).catch(err => {
          throw new Error(err.message + ', please contact us');
        });
      } else {
        await doRegister(name, lastname, email, password);
      }
    } catch (err) {
      setSignupError(err.message || err);
    } finally {
      setShowError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-full w-full'>
      <SideInfo texts={texts} />

      <div className='flex flex-col items-center justify-center w-full'>
        <form className='flex flex-col w-72' onSubmit={handleSubmit(onSubmit)}>
          <span className='text-base font-semibold text-neutral-900 mt-1.5 mb-6'>Create an Internxt account</span>

          <AuthInput
            placeholder='Name'
            label='name'
            type='text'
            icon='userGray'
            register={register}
            required={true}
            minLength={{ value: 1, message: 'Name must not be empty' }}
            error={errors.name}
          />

          <AuthInput
            placeholder='Lastname'
            label='lastname'
            type='text'
            icon='userGray'
            register={register}
            required={true}
            minLength={{ value: 1, message: 'Lastname must not be empty' }}
            error={errors.lastname}
          />

          <AuthInput
            placeholder='Email'
            label='email'
            type='email'
            icon='mailGray'
            register={register}
            required={true}
            minLength={{ value: 1, message: 'Email must not be empty' }}
            pattern={{ value: emailRegexPattern, message: 'Email not valid' }}
            error={errors.email}
          />

          <AuthInput
            placeholder='Password'
            label={'password'}
            type={showPassword ? 'text' : 'password'}
            icon={password
              ? showPassword ? 'eyeSlashGray' : 'eyeGray'
              : 'lockGray'
            }
            register={register}
            required={true}
            minLength={{ value: 1, message: 'Password must not be empty' }}
            error={errors.password}
            onClick={() => setShowPassword(!showPassword)}
          />

          <AuthInput
            placeholder='Confirm password'
            label='confirmPassword'
            type={showPassword ? 'text' : 'password'}
            icon={confirmPassword
              ? showPassword ? 'eyeSlashGray' : 'eyeGray'
              : 'lockGray'
            }
            register={register}
            required={true}
            minLength={{ value: 1, message: 'Password must not be empty' }}
            error={errors.confirmPassword}
            onClick={() => setShowPassword(!showPassword)}
          />

          {
            signupError && showError &&
            <div className='flex ml-3 mt-1 mb-2'>
              <div className='w-1.5 h-1.5 bg-neutral-600 rounded-full mt-1.5 mr-2' />
              <span className='text-neutral-600 text-sm'>{signupError}</span>
            </div>
          }

          <span className='text-xs font-normal text-neutral-500 text-justify mb-3'>
            Internxt uses your password to encrypt and decrypt your files. Due to the secure nature of Internxt, we don't know your password.
            That means that if you forget it, your files will be gone. With us, you're the only owner of your files.
          </span>

          <CheckboxPrimary label='acceptTerms' text='Accept terms, conditions and privacy policy' required={true} register={register} additionalStyling='mt-2 -mb-0' />
          <BaseButton onClick={() => window.open('https://internxt.com/en/legal')} additionalStyling='self-start ml-6 text-xs'>
            More info
          </BaseButton>
          <div className='mt-3' />
          <AuthButton isDisabled={isLoading || !isValid} text='Create an account' textWhenDisabled={isValid ? 'Encrypting...' : 'Create an account'} />
        </form>

        <div className='flex justify-center items-center w-full mt-6'>
          <span className='text-sm text-neutral-500 ml-3 select-none'>Already registered?</span>
          <BaseButton onClick={() => history.push('/login')} additionalStyling='ml-1.5'>
            Log in
          </BaseButton>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
