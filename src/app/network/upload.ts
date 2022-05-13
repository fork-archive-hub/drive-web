import { v4 } from 'uuid';
import EventEmitter from 'events';
import { randomBytes } from 'crypto';
import { Environment } from '@internxt/inxt-js';
import { Network } from '@internxt/sdk/dist/network';

import { createAES256Cipher, encryptFilename, getEncryptedFile, sha256 } from './crypto';
import { NetworkFacade } from './NetworkFacade';
import { finishUpload, getUploadUrl, prepareUpload } from './requests';
import { Abortable } from './Abortable';

export type UploadProgressCallback = (totalBytes: number, uploadedBytes: number) => void;

class UploadAbortedError extends Error {
  constructor() {
    super('Upload aborted');
  }
}


interface NetworkCredentials {
  user: string;
  pass: string;
}

interface IUploadParams {
  filesize: number;
  filecontent: File;
  creds: NetworkCredentials;
  mnemonic: string;
  progressCallback: UploadProgressCallback;
}

export function uploadFileBlob(
  encryptedFile: Blob,
  url: string,
  opts: {
    progressCallback: UploadProgressCallback
  },
): [Promise<void>, Abortable] {
  const uploadRequest = new XMLHttpRequest();
  const eventEmitter = new EventEmitter().once('abort', () => {
    uploadRequest.abort();
  });

  uploadRequest.upload.addEventListener('progress', (e) => {
    opts.progressCallback(e.total, e.loaded);
  });
  uploadRequest.upload.addEventListener('loadstart', (e) => opts.progressCallback(e.total, 0));
  uploadRequest.upload.addEventListener('loadend', (e) => opts.progressCallback(e.total, e.total));

  const uploadFinishedPromise = new Promise<void>((resolve, reject) => {
    uploadRequest.onload = () => {
      if (uploadRequest.status !== 200) {
        return reject(
          new Error('Upload failed with code ' + uploadRequest.status + ' message ' + uploadRequest.response),
        );
      }
      resolve();
    };
    uploadRequest.onerror = reject;
    uploadRequest.onabort = () => reject(new Error('Upload aborted'));
    uploadRequest.ontimeout = () => reject(new Error('Request timeout'));
  });

  uploadRequest.open('PUT', url);
  uploadRequest.send(encryptedFile);

  return [
    uploadFinishedPromise,
    {
      abort: () => {
        eventEmitter.emit('abort');
      },
    },
  ];
}

function getAuthFromCredentials(creds: NetworkCredentials): { username: string, password: string } {
  return {
    username: creds.user,
    password: sha256(Buffer.from(creds.pass)).toString('hex'),
  };
}

/**
 * Uploads a file to the Internxt Network
 * @param bucketId Bucket where file is going to be uploaded
 * @param params Required params for uploading a file
 * @returns Id of the created file
 */
export function uploadFile(bucketId: string, params: IUploadParams): [Promise<string>, Abortable | undefined] {
  let uploadAbortable: Abortable;

  const file: File = params.filecontent;
  const eventEmitter = new EventEmitter().once('abort', () => {
    uploadAbortable?.abort();
  });

  const uploadPromise = (() => {
    const auth = getAuthFromCredentials({
      user: params.creds.user,
      pass: params.creds.pass
    });

    return new NetworkFacade(
      Network.client(
        process.env.REACT_APP_STORJ_BRIDGE as string,
        {
          clientName: 'drive-web',
          clientVersion: '1.0'
        },
        {
          bridgeUser: auth.username,
          userId: auth.password
        }
      ),
    ).upload(
      bucketId,
      params.mnemonic,
      file,
      {
        uploadingCallback: params.progressCallback
      }
    );
  })();

  return [
    uploadPromise,
    {
      abort: () => {
        eventEmitter.emit('abort');
      },
    },
  ];
}
