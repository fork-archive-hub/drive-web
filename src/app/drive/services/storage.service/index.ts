import fileService from '../file.service';
import folderService from '../folder.service';
import { DriveFileData, DriveFolderData, DriveItemData } from '../../types';

export function deleteItems(items: DriveItemData[]): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const item of items) {
    promises.push(
      item.isFolder
        ? folderService.deleteFolder(item as DriveFolderData).then()
        : fileService.deleteFile(item as DriveFileData).then(),
    );
  }

  return Promise.all(promises).then();
}

export function moveItem(
  item: DriveItemData,
  destinationFolderId: number,
  destinationPath: string,
  bucketId: string,
): Promise<void> {
  return item.isFolder
    ? folderService.moveFolder(item as DriveFolderData, destinationFolderId, destinationPath, bucketId).then()
    : fileService.moveFile(item as DriveFileData, destinationFolderId, destinationPath, bucketId).then();
}

const storageService = {
  deleteItems,
  moveItem,
};

export default storageService;
