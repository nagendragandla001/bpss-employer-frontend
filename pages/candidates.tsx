import React from 'react';
import { isMobile } from 'mobile-device-detect';
import isAdaptive from 'utils/isAdaptive';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import authenticationHOC from 'lib/authenticationHOC';
import qs from 'query-string';

const DesktopScreen = dynamic(() => import('screens/authenticated/ApplicationsTab/Desktop/index'), { ssr: false });
const MobileScreen = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile'), { ssr: false });

const ApplicationsPage = ():JSX.Element => {
  const router = useRouter();
  let finalJobId;
  let selectedParams = {} as any;

  if (router?.query?.filter) {
    const params = `${router.query.filter}`;
    // console.log('par', params);
    selectedParams = qs.parse(router.query.filter.toString(), { parseBooleans: true });

    const paramArr = params?.split('&');
    const job = paramArr?.map((p) => {
      const pArr = p.split('=');
      if (pArr[0] === 'job') {
        return pArr[1];
      }
      return '';
    });
    const jobIdValue = job?.filter((j) => j !== '');

    finalJobId = (jobIdValue ? jobIdValue[0] : null);
  }

  if (router?.query?.page) {
    selectedParams.page = router?.query?.page;
  }

  const CurrentRoute = router && router?.route && router.route.replace('/', '');

  if (isAdaptive(CurrentRoute) && isMobile) {
    return <MobileScreen />;
  }
  return <DesktopScreen jobId={finalJobId} filter={selectedParams} />;
};

export default authenticationHOC(ApplicationsPage);
