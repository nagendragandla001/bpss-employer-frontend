import React, { useReducer } from 'react';
import { NextPage } from 'next';
import { isMobile } from 'mobile-device-detect';
import isAdaptive from 'utils/isAdaptive';
import { useRouter } from 'next/router';
import authenticationHOC from 'lib/authenticationHOC';
import dynamic from 'next/dynamic';
import { SettingsInititalState, SettingsReducer } from 'stores/reducers/SettingsReducer';

const DesktopScreen = dynamic(() => import('screens/authenticated/Settings/Desktop/index'), { ssr: false });
const MobileScreen = dynamic(() => import('screens/authenticated/Settings/Mobile/index'), { ssr: false });

const SettingsPage: NextPage = () => {
  const router = useRouter();

  const [state, dispatch] = useReducer(SettingsReducer, SettingsInititalState);
  const CurrentRoute = router && router.route && router.route.replace('/', '');
  if (isAdaptive(CurrentRoute) && isMobile) {
    return <MobileScreen state={state} dispatch={dispatch} />;
  }
  return <DesktopScreen state={state} dispatch={dispatch} />;
};

export default authenticationHOC(SettingsPage);
