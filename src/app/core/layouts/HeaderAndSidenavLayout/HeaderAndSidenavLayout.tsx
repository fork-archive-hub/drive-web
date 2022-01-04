import { Link } from 'react-router-dom';

import Navbar from '../../components/Navbar/Navbar';
import Sidenav from '../../components/Sidenav/Sidenav';
import { uiActions } from 'app/store/slices/ui';
import ReachedPlanLimitDialog from 'app/drive/components/ReachedPlanLimitDialog/ReachedPlanLimitDialog';
import ShareItemDialog from 'app/share/components/ShareItemDialog/ShareItemDialog';
import InviteTeamMemberDialog from 'app/teams/components/InviteTeamMemberDialog/InviteTeamMemberDialog';
import navigationService from '../../services/navigation.service';
import GuestDialog from 'app/guests/components/GuestDialog/GuestDialog';
import { AppView } from '../../types';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import TaskLogger from 'app/tasks/components/TaskLogger/TaskLogger';
import DriveItemInfoMenu from 'app/drive/components/DriveItemInfoMenu/DriveItemInfoMenu';

export interface HeaderAndSidenavLayoutProps {
  children: JSX.Element;
}

export default function HeaderAndSidenavLayout(props: HeaderAndSidenavLayoutProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { children } = props;
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const isSidenavCollapsed = useAppSelector((state) => state.ui.isSidenavCollapsed);
  const itemToShare = useAppSelector((state) => state.storage.itemToShare);
  const toggleIsSidenavCollapsed: () => void = () => dispatch(uiActions.setIsSidenavCollapsed(!isSidenavCollapsed));
  const isShareItemDialogOpen = useAppSelector((state) => state.ui.isShareItemDialogOpen);
  const isReachedPlanLimitDialogOpen = useAppSelector((state) => state.ui.isReachedPlanLimitDialogOpen);
  const isInviteMemberDialogOpen = useAppSelector((state) => state.ui.isInviteMemberDialogOpen);
  const isGuestInviteDialogOpen = useAppSelector((state) => state.ui.isGuestInviteDialogOpen);
  const isDriveItemInfoMenuOpen = useAppSelector((state) => state.ui.isDriveItemInfoMenuOpen);
  const driveItemInfo = useAppSelector((state) => state.ui.currentFileInfoMenuItem);
  const onDriveItemInfoMenuClosed = () => {
    dispatch(uiActions.setFileInfoItem(null));
    dispatch(uiActions.setIsDriveItemInfoMenuOpen(false));
  };

  if (!isAuthenticated) {
    navigationService.push(AppView.Login);
  }

  return isAuthenticated ? (
    <div className="h-auto min-h-full flex flex-col">
      {isShareItemDialogOpen && itemToShare && <ShareItemDialog item={itemToShare} />}
      {isReachedPlanLimitDialogOpen && <ReachedPlanLimitDialog />}
      {isInviteMemberDialogOpen && <InviteTeamMemberDialog />}
      {isGuestInviteDialogOpen && <GuestDialog />}

      <div className="flex-grow flex h-1">
        <Sidenav collapsed={isSidenavCollapsed} onCollapseButtonClicked={toggleIsSidenavCollapsed} />

        <div className="flex flex-col flex-grow bg-white w-1">
          <Navbar />
          <div className="flex-grow flex w-full h-1">
            {children}

            {isDriveItemInfoMenuOpen && driveItemInfo && (
              <DriveItemInfoMenu {...driveItemInfo} onClose={onDriveItemInfoMenuClosed} />
            )}
          </div>
          <TaskLogger />
        </div>
      </div>
    </div>
  ) : (
    <div className="App">
      <h2>
        Please <Link to="/login">login</Link> into your Internxt Drive account
      </h2>
    </div>
  );
}