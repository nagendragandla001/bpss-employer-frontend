import { isMobile } from 'mobile-device-detect';
import dynamic from 'next/dynamic';
import Router, { useRouter } from 'next/router';
import React from 'react';
import isAdaptive from 'utils/isAdaptive';
import authenticationHOC, { AuthenticationHocProps } from 'lib/authenticationHOC';

const JobDetailsDesktopComponent = dynamic(() => import('screens/authenticated/JobDetails/Desktop/index'), { ssr: false });
const JobDetailsMobile = dynamic(() => import('screens/authenticated/JobDetails/Mobile/index'), { ssr: false });

const JobDetails = (props:AuthenticationHocProps):JSX.Element => {
  const { userDetails } = props;
  const router = useRouter();

  const CurrentRoute = router && router.route && router.route.replace('/', '');
  const jobId = (router.query && router.query.id) ? router.query.id.toString() : '';

  const handleBack = (): void => {
    Router.push('/employer-zone/jobs/');
  };

  if (isAdaptive(CurrentRoute) && isMobile) {
    return <JobDetailsMobile id={jobId} userDetails={userDetails} onCancel={handleBack} />;
  }
  return <JobDetailsDesktopComponent userDetails={userDetails} id={jobId} />;
};

export default authenticationHOC(JobDetails);
