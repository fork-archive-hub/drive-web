import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
import UilTrashAlt from '@iconscout/react-unicons/icons/uil-trash-alt';
import UilUserPlus from '@iconscout/react-unicons/icons/uil-user-plus';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { InfoInvitationsMembers, TeamsSettings } from '../../types';
import { RootState } from 'app/store';
import BaseInput from 'app/shared/components/forms/inputs/BaseInput';
import AuthButton from 'app/shared/components/AuthButton';
import BaseDialog from 'app/shared/components/BaseDialog/BaseDialog';
import { getMembers, removeInvitation, removeMember, sendEmailTeamsMember } from '../../services/teams.service';
import { uiActions } from 'app/store/slices/ui';
import i18n from 'app/i18n/services/i18n.service';
import notificationsService, { ToastType } from 'app/notifications/services/notifications.service';
import errorService from 'app/core/services/error.service';
import { IFormValues } from 'app/core/types';

interface InviteTeamMemberDialogProps {
  team: TeamsSettings | undefined | null;
}

const InviteTeamMemberDialog = ({ team }: InviteTeamMemberDialogProps) => {
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    reset,
  } = useForm<IFormValues>({ mode: 'onChange' });
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isInviteMemberDialogOpen);
  const [members, setMembers] = useState<InfoInvitationsMembers[]>([]);

  useEffect(() => {
    getMembers().then((member) => {
      console.log('members', JSON.stringify(members, null, 2));
      setMembers(member);
    });
  }, []);

  const onClose = (): void => {
    reset();
    dispatch(uiActions.setIsInviteMemberDialogOpen(false));
  };

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    try {
      if (team && team.isAdmin) {
        await sendEmailTeamsMember(formData.email);
        notificationsService.show(i18n.get('success.teamInvitationSent', { email: formData.email }), ToastType.Success);
        const userExists = members.some((userObj) => userObj.user === formData.email);

        if (!userExists) {
          members.push({
            isMember: false,
            isInvitation: true,
            user: formData.email,
          });
        }
      }
    } catch (err: unknown) {
      const castedError = errorService.castError(err);
      notificationsService.show(castedError.message, ToastType.Error);
    }
  };

  const deleteMembers = async (memberToDelete: InfoInvitationsMembers) => {
    const resource = memberToDelete.isMember ? 'member' : 'invitation';

    try {
      if (resource === 'member') {
        await removeMember(memberToDelete);
      } else {
        // await removeInvitation(memberToDelete.)
      }
      
      const filterRemovedMember = members.filter((member) => member.user !== memberToDelete.user);

      setMembers(filterRemovedMember);
      notificationsService.show(i18n.get('success.deletedTeamMember', { resource }), ToastType.Success);
    } catch (err: unknown) {
      const castedError = errorService.castError(err);
      notificationsService.show(castedError.message, ToastType.Error);
    }
  };

  return (
    <BaseDialog isOpen={isOpen} title="Manage your team" panelClasses="w-156" onClose={onClose}>
      <div className="flex mt-2 items-center justify-center text-center px-12">
        <span>Welcome to your Business Drive Account. Here you can add and remove team members and invitations</span>
      </div>

      <div className="flex flex-col self-center my-6 items-start w-96">
        <form className="flex w-full m" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex-1">
            <BaseInput
              placeholder="Type email: jhondoe@internxt.com"
              label="email"
              type="email"
              register={register}
              required={true}
              minLength={{ value: 1, message: 'Email must not be empty' }}
              error={errors.email}
            />
          </div>

          <div className="w-16 ml-2.5">
            <AuthButton text="Invite" textWhenDisabled={isValid ? 'Inviting...' : 'Invite'} isDisabled={!isValid} />
          </div>
        </form>

        {members.length > 0 && (
          <div className="flex flex-col mt-6 w-full overflow-y-auto h-16 mb-8">
            {Object.values(members).map((member) => {
              console.log(member);
              return (
                <div className="flex justify-between mb-2.5" key={member.user}>
                  {member.isInvitation ? (
                    <UilUserPlus className="text-gray-50 h-5 mr-1" />
                  ) : (
                    <UilUserPlus className="text-green-40 h-5 mr-1" />
                  )}
                  <div className="flex flex-1 justify-start px-5">
                    <span className="truncate overflow-ellipsis w-72">{member.user}</span>
                  </div>
                  <UilTrashAlt
                    className="cursor-pointer text-blue-60 h-5 transition duration-300 hover:text-blue-80"
                    onClick={() => deleteMembers(member)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BaseDialog>
  );
};

export default connect((state: RootState) => ({
  team: state.team.team,
}))(InviteTeamMemberDialog);
