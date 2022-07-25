import { SVGProps } from 'react';
import { AppSumoDetails } from '@internxt/sdk/dist/shared/types/appsumo';
import { RenewalPeriod } from '../../payment/types';

export interface DriveFolderData {
  id: number;
  bucket: string | null;
  color: string | null;
  createdAt: string;
  encrypt_version: string | null;
  icon: string | null;
  iconId: number | null;
  icon_id: number | null;
  isFolder: boolean;
  name: string;
  parentId: number;
  parent_id: number | null;
  updatedAt: string;
  userId: number;
  user_id: number;
}

export interface DriveFolderMetadataPayload {
  itemName?: string;
  color?: string;
  icon?: string;
}

export interface DriveFileData {
  bucket: string;
  createdAt: string;
  created_at: string;
  deleted: false;
  deletedAt: null;
  encrypt_version: string;
  fileId: string;
  folderId: number;
  folder_id: number;
  id: number;
  name: string;
  size: number;
  type: string;
  updatedAt: string;
}

export interface DriveFileMetadataPayload {
  itemName?: string;
}

export type DriveItemData = DriveFileData & DriveFolderData;

export interface DriveItemPatch {
  name?: string;
}

export interface FileInfoMenuItem {
  id: string;
  icon: React.FunctionComponent<SVGProps<SVGSVGElement>>;
  title: string;
  features: { label: string; value: string }[];
}

export interface FolderTree {
  id: number;
  bucket: string | null;
  children: FolderTree[];
  encrypt_version: string;
  files: DriveFileData[];
  name: string;
  parentId: number;
  parent_id: number;
  userId: number;
  user_id: number;
  createdAt: string;
  updatedAt: string;
}

export type StoragePlan = {
  planId: string;
  productId: string;
  name: string;
  simpleName: string;
  paymentInterval: RenewalPeriod;
  price: number;
  monthlyPrice: number;
  currency: string;
  isTeam: boolean;
  isLifetime: boolean;
  renewalPeriod: RenewalPeriod;
  storageLimit: number;
  isAppSumo?: boolean;
  details?: AppSumoDetails;
};

export interface FolderPath {
  name: string;
  id: number;
}

export enum FileViewMode {
  List = 'list',
  Grid = 'grid',
}

export enum DownloadFolderMethod {
  FileSystemAccessAPI = 'file-system-access-api',
  StreamSaver = 'stream-saver',
}
