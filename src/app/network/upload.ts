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
  abortController?: AbortController;
  parts?: number;
}

export function uploadFileBlob(
  encryptedFile: Blob,
  url: string,
  opts: {
    progressCallback: UploadProgressCallback,
    abortController?: AbortController
  },
): Promise<XMLHttpRequest> {
  const uploadRequest = new XMLHttpRequest();

  opts.abortController?.signal.addEventListener('abort', () => {
    console.log('aborting');
    uploadRequest.abort();
  }, { once: true });

  uploadRequest.upload.addEventListener('progress', (e) => {
    opts.progressCallback(e.total, e.loaded);
  });
  uploadRequest.upload.addEventListener('loadstart', (e) => opts.progressCallback(e.total, 0));
  uploadRequest.upload.addEventListener('loadend', (e) => opts.progressCallback(e.total, e.total));

  const uploadFinishedPromise = new Promise<XMLHttpRequest>((resolve, reject) => {
    uploadRequest.onload = () => {
      if (uploadRequest.status !== 200) {
        return reject(
          new Error('Upload failed with code ' + uploadRequest.status + ' message ' + uploadRequest.response),
        );
      }
      resolve(uploadRequest);
    };
    uploadRequest.onerror = reject;
    uploadRequest.onabort = () => reject(new Error('Upload aborted'));
    uploadRequest.ontimeout = () => reject(new Error('Request timeout'));
  });

  uploadRequest.open('PUT', url);
  // ! Uncomment this line for multipart to work:
  // uploadRequest.setRequestHeader('Content-Type', '');
  uploadRequest.send(encryptedFile);

  return uploadFinishedPromise;
}

function getAuthFromCredentials(creds: NetworkCredentials): { username: string, password: string } {
  return {
    username: creds.user,
    password: sha256(Buffer.from(creds.pass)).toString('hex'),
  };
}

export function uploadFile(bucketId: string, params: IUploadParams): Promise<string> {
  const file: File = params.filecontent;

  const auth = getAuthFromCredentials({
    user: params.creds.user,
    pass: params.creds.pass
  });

  const facade = new NetworkFacade(
    Network.client(
      process.env.REACT_APP_STORJ_BRIDGE as string,
      {
        clientName: 'drive-web',
        clientVersion: '1.0',
      },
      {
        bridgeUser: auth.username,
        userId: auth.password,
      },
    ),
  );

  if (params.parts) {
    return facade.uploadMultipart(bucketId, params.mnemonic, file, {
      uploadingCallback: params.progressCallback,
      abortController: params.abortController,
      parts: params.parts,
    });
    }

  return facade.upload(bucketId, params.mnemonic, file, {
    uploadingCallback: params.progressCallback,
    abortController: params.abortController,
  });
}
