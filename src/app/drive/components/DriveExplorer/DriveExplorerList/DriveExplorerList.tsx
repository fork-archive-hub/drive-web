import React, { ReactNode } from 'react';
import UilArrowDown from '@iconscout/react-unicons/icons/uil-arrow-down';
import UilArrowUp from '@iconscout/react-unicons/icons/uil-arrow-up';
import { connect } from 'react-redux';

import DriveExplorerListItem from '../DriveExplorerItem/DriveExplorerListItem/DriveExplorerListItem';
import { AppDispatch, RootState } from '../../../../store';
import { storageActions } from '../../../../store/slices/storage';
import i18n from '../../../../i18n/services/i18n.service';
import { DriveItemData } from '../../../types';
import { OrderDirection, OrderSettings } from '../../../../core/types';
import DriveListItemSkeleton from '../../DriveListItemSkeleton/DriveListItemSkeleton';

interface DriveExplorerListProps {
  isLoading: boolean;
  items: DriveItemData[];
  selectedItems: DriveItemData[];
  order: OrderSettings;
  dispatch: AppDispatch;
}

class DriveExplorerList extends React.Component<DriveExplorerListProps> {
  constructor(props: DriveExplorerListProps) {
    super(props);
  }

  get hasItems(): boolean {
    return this.props.items.length > 0;
  }

  get itemsList(): JSX.Element[] {
    return this.props.items.map((item: DriveItemData) => {
      const itemParentId = item.parentId || item.folderId;
      const itemKey = `${item.isFolder ? 'folder' : 'file'}-${item.id}-${itemParentId}`;

      return <DriveExplorerListItem key={itemKey} item={item} />;
    });
  }

  get itemsFileList(): JSX.Element[] {
    return this.props.items.filter((item) => !item.isFolder).map((item: DriveItemData) => {
      const itemParentId = item.parentId || item.folderId;
      const itemKey = `'file'-${item.id}-${itemParentId}`;

      return <DriveExplorerListItem key={itemKey} item={item} />;
    });
  }

  get itemsFolderList(): JSX.Element[] {
    return this.props.items.filter((item) => item.isFolder).map((item: DriveItemData) => {
      const itemParentId = item.parentId || item.folderId;
      const itemKey = `'folder'-${item.id}-${itemParentId}`;

      return <DriveExplorerListItem key={itemKey} item={item} />;
    });
  }

  get isAllSelected(): boolean {
    const { selectedItems, items } = this.props;

    return selectedItems.length === items.length && items.length > 0;
  }

  get loadingSkeleton(): JSX.Element[] {
    return Array(10)
      .fill(0)
      .map((n, i) => <DriveListItemSkeleton key={i} />);
  }

  onSelectAllButtonClicked = () => {
    const { dispatch, items } = this.props;

    this.isAllSelected ? dispatch(storageActions.clearSelectedItems()) : dispatch(storageActions.selectItems(items));
  };

  render(): ReactNode {
    const { dispatch, isLoading, order } = this.props;
    const sortBy = (orderBy: string) => {
      const direction =
        order.by === orderBy
          ? order.direction === OrderDirection.Desc
            ? OrderDirection.Asc
            : OrderDirection.Desc
          : OrderDirection.Asc;
      dispatch(storageActions.setOrder({ by: orderBy, direction }));
    };
    const sortButtonFactory = () => {
      const IconComponent = order.direction === OrderDirection.Desc ? UilArrowDown : UilArrowUp;
      return <IconComponent className="ml-2" />;
    };

    return (
      <div className="flex flex-col flex-grow bg-white h-full">
        <div
          className="files-list font-semibold flex border-b border-neutral-30 bg-white text-neutral-500 py-3 text-sm"
        >
          <div className="w-0.5/12 pl-3 flex items-center justify-start box-content">
            <input
              disabled={!this.hasItems}
              readOnly
              checked={this.isAllSelected}
              onClick={this.onSelectAllButtonClicked}
              type="checkbox"
              className="pointer-events-auto"
            />
          </div>
          <div className="w-1/12 px-3 flex items-center box-content cursor-pointer" onClick={() => sortBy('type')}>
            {i18n.get('drive.list.columns.type')}
            {order.by === 'type' && sortButtonFactory()}
          </div>
          <div className="flex-grow flex items-center cursor-pointer" onClick={() => sortBy('name')}>
            {i18n.get('drive.list.columns.name')}
            {order.by === 'name' && sortButtonFactory()}
          </div>
          <div className="w-2/12 hidden items-center xl:flex"></div>
          <div className="w-3/12 hidden items-center lg:flex cursor-pointer" onClick={() => sortBy('updatedAt')}>
            {i18n.get('drive.list.columns.modified')}
            {order.by === 'updatedAt' && sortButtonFactory()}
          </div>
          <div className="w-1/12 flex items-center cursor-pointer" onClick={() => sortBy('size')}>
            {i18n.get('drive.list.columns.size')}
            {order.by === 'size' && sortButtonFactory()}
          </div>
          <div className="w-1/12 flex items-center rounded-tr-4px">{i18n.get('drive.list.columns.actions')}</div>
        </div>
        <div className="h-full overflow-y-auto">{isLoading ? (
          this.loadingSkeleton
          ) : (
            <>
             { this.itemsFolderList}
             { this.itemsFileList}
            </>
          )}</div>
      </div>
    );
  }
}

export default connect((state: RootState) => ({
  selectedItems: state.storage.selectedItems,
  order: state.storage.order,
}))(DriveExplorerList);
