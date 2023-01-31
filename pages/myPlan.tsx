import React from 'react';
import { NextPage } from 'next';
import authenticationHOC from 'lib/authenticationHOC';
import dynamic from 'next/dynamic';
import isAdaptive from 'utils/isAdaptive';
import { useRouter } from 'next/router';
import { isMobile } from 'mobile-device-detect';
import MobileMyPlan from 'screens/authenticated/Passbook/mobile';

const PassbookScreen = dynamic(() => import('screens/authenticated/Passbook/index'), { ssr: false });

const PassbookPage: NextPage = () => {
  const router = useRouter();
  const CurrentRoute = router && router.route && router.route.replace('/', '');
  if (isAdaptive(CurrentRoute) && isMobile) {
    return <MobileMyPlan visible />;
  }
  return <PassbookScreen />;
};

export default authenticationHOC(PassbookPage);
