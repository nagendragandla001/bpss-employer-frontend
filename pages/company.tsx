import { NextPage } from 'next';
import React from 'react';
import dynamic from 'next/dynamic';
import isAdaptive from 'utils/isAdaptive';
import { useRouter } from 'next/router';
import { isMobile } from 'mobile-device-detect';

const CompanyDesktopComponent = dynamic(() => import('screens/authenticated/CompanyTab/Desktop/index'), { ssr: false });
const MobileScreen = dynamic(() => import('screens/authenticated/CompanyTab/Mobile/index'), { ssr: false });

const Company: NextPage = () => {
  const router = useRouter();
  const CurrentRoute = router && router.route && router.route.replace('/', '');
  if (isAdaptive(CurrentRoute) && isMobile) {
    return <MobileScreen />;
  }
  return <CompanyDesktopComponent />;
};

export default Company;
