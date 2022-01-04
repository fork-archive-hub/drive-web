import { Fragment, useState, useEffect } from 'react';
import UilShieldPlus from '@iconscout/react-unicons/icons/uil-shield-plus';

import { AccountViewTab } from '..';
import TextBlock from 'app/shared/components/TextBlock/TextBlock';
import screenService from '../../../../services/screen.service';
import DeleteAccountDialog from 'app/auth/components/DeleteAccountDialog/DeleteAccountDialog';
import BaseButton from 'app/shared/components/forms/BaseButton';
import moneyService from 'app/payment/services/money.service';
import usageService from 'app/drive/services/usage.service';
import { userSelectors } from 'app/store/slices/user';
import { sessionSelectors } from 'app/store/slices/session/session.selectors';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { bytesToString } from 'app/drive/services/size.service';
import limitService from 'app/drive/services/limit.service';
import i18n from 'app/i18n/services/i18n.service';
import { setCurrentAccountTab } from 'app/store/slices/ui';
import { planSelectors } from 'app/store/slices/plan';
import InviteAFriendWidget from 'app/auth/components/InviteAFriendWidget/InviteAFriendWidget';

const AccountPlanInfoTab = (): JSX.Element => {
  const [isLgScreen, setIsLgScreen] = useState(screenService.isLg());
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const user = useAppSelector((state) => state.user.user);
  const fullName = useAppSelector(userSelectors.userFullName);
  const nameLetters = useAppSelector(userSelectors.nameLetters);
  const isLoadingPlanLimit = useAppSelector((state) => state.plan.isLoadingPlanLimit);
  const planUsage = useAppSelector((state) => state.plan.planUsage);
  const planLimit = useAppSelector(planSelectors.planLimitToShow);
  const isLoadingPlans = useAppSelector((state) => state.plan.isLoadingPlans);
  const currentPlan = useAppSelector(planSelectors.currentPlan);
  const isTeam = useAppSelector(sessionSelectors.isTeam);
  const isCurrentPlanLifetime = useAppSelector(planSelectors.isCurrentPlanLifetime);
  const dispatch = useAppDispatch();
  const onUpgradeButtonClicked = () => {
    dispatch(setCurrentAccountTab(AccountViewTab.Plans));
  };
  const onDeletePermanentlyAccountClicked = (): void => {
    setIsDeleteAccountDialogOpen(true);
  };
  const usagePercent = usageService.getUsagePercent(planUsage, planLimit);
  const progressBarFillWidth = isLoadingPlans || isLoadingPlanLimit ? 0 : `${usagePercent}%`;
  const progressBarFillStyle = { width: progressBarFillWidth };
  const totalAmountFormatted =
    currentPlan?.price.toFixed(2) + moneyService.getCurrencySymbol(currentPlan?.currency || '');

  useEffect(() => {
    setIsLgScreen(screenService.isLg());
  });

  return (
    <Fragment>
      <DeleteAccountDialog isOpen={isDeleteAccountDialogOpen} onClose={() => setIsDeleteAccountDialogOpen(false)} />

      <div className="flex flex-col pt-10 items-center">
        {/* ACCOUNT INFO */}
        <div className={`${isLgScreen ? '' : 'mx-auto'} max-w-sm w-full mb-12`}>
          {/* PERSONAL */}
          <div className={`${isLgScreen ? '' : 'justify-center'} flex mb-12`}>
            <div className="w-12 h-12 bg-blue-20 text-blue-60 rounded-1/2 flex justify-center items-center mr-4">
              {nameLetters}
            </div>
            <div>
              <span className="block font-semibold">{isTeam ? 'Business' : fullName}</span>
              <span className="block">{user?.email}</span>
            </div>
          </div>

          {/* USAGE */}
          <div className="mb-12">
            <h4 className={`${isLgScreen ? '' : 'text-center'} mb-1`}>{i18n.get('drive.usage')}</h4>
            <div className="text-sm text-m-neutral-70">
              {isLoadingPlans || isLoadingPlanLimit ? (
                <span className="text-center w-full">{i18n.get('general.loading.default')}</span>
              ) : (
                <span className={`${isLgScreen ? '' : 'text-center'} block w-full m-0`}>
                  {bytesToString(planUsage) || '0'} of {limitService.formatLimit(planLimit)}
                </span>
              )}

              <div className="flex justify-start h-1.5 w-full bg-l-neutral-30 rounded-lg overflow-hidden mt-0.5">
                <div className="h-full bg-blue-70" style={progressBarFillStyle} />
              </div>
            </div>
          </div>

          {/* CURRENT PLAN */}
          <div>
            <h4 className={`${isLgScreen ? '' : 'text-center'} mb-1`}>{i18n.get('drive.currentPlan')}</h4>
            {!isLoadingPlans ? (
              <div className="flex justify-between w-full">
                <div>
                  <span className="text-neutral-700 font-bold text-xl">{limitService.formatLimit(planLimit)}</span>

                  <div className="flex w-full items-start text-neutral-500 text-xs flex-col">
                    {currentPlan?.isAppSumo ? (
                      <>
                        <span>{i18n.get(`appSumo.tiers.${currentPlan.details?.planId as string}`)}</span>
                        <span>
                          {i18n.get(`appSumo.members.${currentPlan.details?.planId as string}`, { total: '\u221E' })}
                        </span>
                      </>
                    ) : currentPlan?.planId ? (
                      <Fragment>
                        <span>
                          {i18n.get('general.billing.billedEachPeriod', {
                            price: totalAmountFormatted,
                            period: i18n.get(`general.renewalPeriod.${currentPlan?.renewalPeriod}`).toLowerCase(),
                          })}
                        </span>
                      </Fragment>
                    ) : (
                      <span>{!isCurrentPlanLifetime && 'Free plan'}</span> // ! Pending to show "lifetime" label when able to determine the user's plan
                    )}
                  </div>
                </div>
                <BaseButton
                  className={`${isCurrentPlanLifetime ? 'hidden' : ''} primary`}
                  onClick={onUpgradeButtonClicked}
                >
                  {i18n.get('actions.upgradeNow')}
                </BaseButton>
              </div>
            ) : (
              <span className="">{i18n.get('general.loading.default')}</span>
            )}
          </div>
        </div>

        <InviteAFriendWidget className="mb-20" />

        {/* MORE INFO & DELETE ACCOUNT */}
        <div>
          <div className="grid grid-cols-2 gap-14 w-full justify-around mb-14">
            <TextBlock
              icon={UilShieldPlus}
              title={i18n.get('views.account.tabs.info.advice1.title')}
              description={i18n.get('views.account.tabs.info.advice1.description')}
            />
            <TextBlock
              icon={UilShieldPlus}
              title={i18n.get('views.account.tabs.info.advice2.title')}
              description={i18n.get('views.account.tabs.info.advice2.description')}
            />
          </div>
          {!currentPlan?.isAppSumo && (
            <span
              className="block text-center text-m-neutral-80 cursor-pointer mt-10"
              onClick={onDeletePermanentlyAccountClicked}
            >
              {i18n.get('actions.deleteAccount')}
            </span>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default AccountPlanInfoTab;