import { Fragment, useEffect } from 'react';
import { PencilSimple } from '@phosphor-icons/react';
import { items } from '@internxt/lib';
import sizeService from '../../../../../drive/services/size.service';
import dateService from '../../../../../core/services/date.service';
import iconService from '../../../../services/icon.service';
import transformItemService from '../../../../../drive/services/item-transform.service';
import { DriveExplorerItemProps } from '..';
import useDriveItemActions from '../hooks/useDriveItemActions';
import { useDriveItemDrag, useDriveItemDrop } from '../hooks/useDriveItemDragAndDrop';
import useDriveItemStoreProps from '../hooks/useDriveStoreProps';
import './DriveExplorerListItem.scss';
import usersIcon from 'assets/icons/users.svg';

const DriveExplorerListItem = ({ item }: DriveExplorerItemProps): JSX.Element => {
  const { isItemSelected, isSomeItemSelected, isEditingName, dirtyName } = useDriveItemStoreProps();
  const {
    nameInputRef,
    onNameChanged,
    onNameBlurred,
    onNameClicked,
    onEditNameButtonClicked,
    onNameEnterKeyDown,
    onDownloadButtonClicked,
    onDeleteButtonClicked,
    onShareButtonClicked,
    onItemClicked,
    onItemDoubleClicked,
  } = useDriveItemActions(item);

  const { connectDragSource, isDraggingThisItem } = useDriveItemDrag(item);
  const { connectDropTarget, isDraggingOverThisItem } = useDriveItemDrop(item);
  const isDraggingClassNames: string = isDraggingThisItem ? 'is-dragging' : '';
  const isDraggingOverClassNames: string = isDraggingOverThisItem ? 'drag-over-effect' : '';
  const selectedClassNames: string = isItemSelected(item) ? 'selected' : '';
  const ItemIconComponent = iconService.getItemIcon(item.isFolder, item.type);

  useEffect(() => {
    if (isEditingName(item)) {
      const current = nameInputRef.current;
      if (current && current !== null) {
        nameInputRef.current.selectionStart = nameInputRef.current.value.length;
        nameInputRef.current.selectionEnd = nameInputRef.current.value.length;
        nameInputRef.current.focus();
      }
    }
  }, [isEditingName(item)]);

  const nameNodefactory = () => {
    const spanDisplayClass: string = !isEditingName(item) ? 'block' : 'hidden';

    return (
      <Fragment>
        {((item.isFolder && !item.deleted) || (!item.isFolder && item.status === 'EXISTS')) && (
          <div className={`${isEditingName(item) ? 'flex' : 'hidden'}`}>
            <input
              className="dense no-ring rect select-text border border-white"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              ref={nameInputRef}
              type="text"
              value={dirtyName}
              placeholder="Name"
              onChange={onNameChanged}
              onBlur={onNameBlurred}
              onKeyDown={onNameEnterKeyDown}
              autoFocus
              name="fileName"
            />
            <span className="ml-1">{transformItemService.showItemExtensionType(item)}</span>
          </div>
        )}
        <div className="file-list-item-name flex max-w-full items-center">
          <span
            data-test={`${item.isFolder ? 'folder' : 'file'}-name`}
            className={`${spanDisplayClass} file-list-item-name-span`}
            title={transformItemService.getItemPlainNameWithExtension(item) ?? items.getItemDisplayName(item)}
            onClick={
              (item.isFolder && !item.deleted) || (!item.isFolder && item.status === 'EXISTS')
                ? onNameClicked
                : undefined
            }
          >
            {transformItemService.getItemPlainNameWithExtension(item) ?? items.getItemDisplayName(item)}
          </span>
          {!isEditingName && ((item.isFolder && !item.deleted) || (!item.isFolder && item.status === 'EXISTS')) && (
            <PencilSimple onClick={onEditNameButtonClicked} className="file-list-item-edit-name-button" />
          )}
        </div>
      </Fragment>
    );
  };
  const isItemShared = (item.sharings?.length ?? 0) > 0;

  const template = (
    <div
      className={`${selectedClassNames} ${isDraggingOverClassNames} ${isDraggingClassNames} file-list-item group`}
      onClick={onItemClicked}
      onDoubleClick={
        (item.isFolder && !item.deleted) || (!item.isFolder && item.status === 'EXISTS')
          ? onItemDoubleClicked
          : undefined
      }
      data-test={`file-list-${item.isFolder ? 'folder' : 'file'}`}
    >
      <div className="flex min-w-activity flex-grow items-center">
        {/* ICON */}
        <div className="box-content flex items-center pr-4">
          <div className="flex h-10 w-10 justify-center drop-shadow-soft filter">
            <ItemIconComponent
              className="h-full"
              data-test={`file-list-${
                item.isFolder ? 'folder' : 'file'
              }-${transformItemService.getItemPlainNameWithExtension(item)}`}
            />
            {isItemShared && (
              <img
                className="group-hover:border-slate-50 absolute -bottom-1 -right-2 ml-3 flex h-5 w-5 flex-col items-center justify-center place-self-end rounded-full border-2 border-white bg-primary p-0.5 text-white caret-white group-active:border-blue-100"
                src={usersIcon}
                width={13}
                alt="shared users"
              />
            )}
          </div>
        </div>

        {/* NAME */}
        <div className="flex flex-grow items-center pr-2">
          <div className="flex max-w-full items-center">
            <span
              data-test={`${item.isFolder ? 'folder' : 'file'}-name`}
              className={'file-list-item-name-span'}
              title={transformItemService.getItemPlainNameWithExtension(item) ?? items.getItemDisplayName(item)}
              onClick={
                (item.isFolder && !item.deleted) || (!item.isFolder && item.status === 'EXISTS')
                  ? onNameClicked
                  : undefined
              }
            >
              {transformItemService.getItemPlainNameWithExtension(item) ?? items.getItemDisplayName(item)}
            </span>
          </div>
        </div>
      </div>

      {
        /* DROPPABLE ZONE */
        ((item.isFolder && !item.deleted) || (!item.isFolder && item.status === 'EXISTS')) &&
          connectDropTarget(<div className="absolute top-0 h-full w-1/2 group-hover:invisible"></div>)
      }

      {/* DATE */}
      <div className="w-date items-center whitespace-nowrap">
        {dateService.format(item.updatedAt, 'DD MMMM YYYY. HH:mm')}
      </div>

      {/* SIZE */}
      <div className="w-size items-center whitespace-nowrap">
        {sizeService.bytesToString(item.size, false) === '' ? (
          <span className="opacity-25">—</span>
        ) : (
          sizeService.bytesToString(item.size, false)
        )}
      </div>
    </div>
  );

  return isEditingName(item) ? template : (connectDragSource(template) as JSX.Element);
};

export default DriveExplorerListItem;
