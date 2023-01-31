import { FormInstance } from 'antd';
import JobPostingHOC from 'lib/jobPostingHOC';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

interface PropsInterface {
  form: FormInstance;
  isNewUser: boolean;
  setIsNewUser: (state: boolean)=>void;
  userDetails: any;
  orgStore: any;
  jpCredits: any;
}

const JobPostFormBasicDetailsComponent = dynamic(() => import('screens/authenticated/JobPostingForm/BasicDetailsForm'), { ssr: false });

const JobPostFormBasicDetails: NextPage<PropsInterface> = (props: PropsInterface) => {
  const {
    form, isNewUser, userDetails, setIsNewUser, orgStore, jpCredits,
  } = props;

  return (
    <JobPostFormBasicDetailsComponent
      form={form}
      isNewUser={isNewUser}
      userDetails={userDetails}
      setIsNewUser={setIsNewUser}
      orgStore={orgStore}
      jpCredits={jpCredits}
    />
  );
};

export default JobPostingHOC(JobPostFormBasicDetails,
  { step: 1 });
