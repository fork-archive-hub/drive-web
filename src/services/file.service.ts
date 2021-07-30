import fileDownload from 'js-file-download';

import { getHeaders } from '../lib/auth';
import { DevicePlatform } from '../models/enums';
import { DriveFileData, DriveFileMetadataPayload } from '../models/interfaces';
import analyticsService from './analytics.service';
import localStorageService from './localStorage.service';

export function updateMetaData(itemId: string, data: DriveFileMetadataPayload): Promise<void> {
  const user = localStorageService.getUser();
  const isTeam = user?.teams;

  return fetch(`/api/storage/file/${itemId}/meta`, {
    method: 'post',
    headers: getHeaders(true, true, isTeam),
    body: JSON.stringify(data)
  }).then(() => {
    analyticsService.trackFileRename({
      file_id: itemId,
      email: user.email,
      platform: DevicePlatform.Web
    });
  })
    .catch((err) => {
      throw new Error(`Cannot update metadata file ${err}`);
    });
}

export function deleteFile(fileData: DriveFileData, isTeam: boolean): Promise<void> {
  const user = localStorageService.getUser();
  const fetchOptions = {
    method: 'DELETE',
    headers: getHeaders(true, false, isTeam)
  };

  return fetch(`/api/storage/folder/${fileData.folderId}/file/${fileData.id}`, fetchOptions).then(() => {
    analyticsService.trackDeleteItem(fileData, {
      email: user.email,
      platform: DevicePlatform.Web
    });
  });
}

const fileService = {
  updateMetaData,
  deleteFile
};

export default fileService;