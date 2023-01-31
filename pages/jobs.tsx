import React, { useReducer } from 'react';
import { isMobile } from 'mobile-device-detect';
import isAdaptive from 'utils/isAdaptive';
import { useRouter } from 'next/router';
import authenticationHOC, { AuthenticationHocProps } from 'lib/authenticationHOC';
import dynamic from 'next/dynamic';
import jobsTabReducer from 'stores/reducers/jobsTabReducer';
import { IJobsTabData } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';

const DesktopScreen = dynamic(() => import('screens/authenticated/JobsTab/Desktop/index'), { ssr: false });
const MobileScreen = dynamic(() => import('screens/authenticated/JobsTab/Mobile/index'), { ssr: false });

const initialState:IJobsTabData = {
  refresh: true,
  jobs: [],
  dataLoading: true,
  currentTab: 'open',
  showUnverifiedEmailNotification: true,
  limit: 10,
  offset: 0,
  totalJobs: 0,
  pricing_stats: {
    total_pricing_stats: {},
    plan_wise_pricing_stats: [],
  },
  open: 0,
  paused: 0,
  closed: 0,
  drafts: 0,
  unapproved: 0,
  orgDataLoaded: false,
  orgId: '',
  offices: [],
  managers: [],
  contactsUnlocksLeft: 0,
  orgHasNoJobs: false,

};

const JobsTab = (props:AuthenticationHocProps): JSX.Element => {
  const [state, dispatch] = useReducer(jobsTabReducer, initialState);
  const { userDetails } = props;
  const router = useRouter();
  const CurrentRoute = router && router.route && router.route.replace('/', '');
  if (isAdaptive(CurrentRoute) && isMobile) {
    return <MobileScreen userDetails={userDetails} state={state} dispatch={dispatch} />;
  }
  return <DesktopScreen userDetails={userDetails} state={state} dispatch={dispatch} />;
};

export default authenticationHOC(JobsTab);
