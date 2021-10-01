import { DriveItemData } from '../../../models/interfaces';

export enum DriveItemAction {
  Rename,
  Download,
  Share,
  Info,
  Delete,
}

export interface DriveItemProps {
  item: DriveItemData;
}