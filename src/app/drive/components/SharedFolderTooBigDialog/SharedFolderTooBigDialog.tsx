import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import BaseDialog from 'app/shared/components/BaseDialog/BaseDialog';
import BaseButton from 'app/shared/components/forms/BaseButton';
import { uiActions } from 'app/store/slices/ui';
import './SharedFolderTooBigDialog.scss';
import { get } from 'app/i18n/services/i18n.service';

const SharedFolderTooBigDialog = (): JSX.Element => {
  const isOpen = useAppSelector((state) => state.ui.isSharedFolderTooBigDialogOpen);
  const dispatch = useAppDispatch();

  const onClose = (): void => {
    dispatch(uiActions.setIsSharedFolderTooBigDialogOpen(false));
  };

  return (
    <BaseDialog title={get('error.titleSharedFolderTooBig')} isOpen={isOpen} onClose={onClose}>
      <span className="my-6 block w-full px-8 text-center text-base text-neutral-900">
        {get('error.sharedFolderTooBig')}&nbsp;
        {get('error.workingOnIt')}{' '}
        <a href={'https://help.internxt.com/en/'} target="_blank">
          See more
        </a>
      </span>

      <div className="bg-l-neutral-20 flex w-full items-center justify-center py-6">
        <div className="flex w-64 px-8">
          <BaseButton onClick={() => onClose()} className="transparent mr-2 w-11/12">
            {get('actions.dismiss')}
          </BaseButton>
        </div>
      </div>
    </BaseDialog>
  );
};

export default SharedFolderTooBigDialog;
