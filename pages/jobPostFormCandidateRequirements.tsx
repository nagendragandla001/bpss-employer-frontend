import { FormInstance } from 'antd/lib/form';
import JobPostingHOC from 'lib/jobPostingHOC';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

interface PropsInterface {
  form: FormInstance;
  orgStore: any;
  isNewUser: boolean;
  jpCredits: number;
}

const JobPostCandidateReqComponent = dynamic(() => import('screens/authenticated/JobPostingForm/CandidateRequiremntsForm'), { ssr: false });

const JobPostingCandidateRequirements: NextPage<PropsInterface> = (props: PropsInterface) => {
  const {
    form, orgStore, isNewUser, jpCredits,
  } = props;
  return (
    <JobPostCandidateReqComponent
      form={form}
      orgStore={orgStore}
      isNewUser={isNewUser}
      jpCredits={jpCredits}
    />
  );
};

export default JobPostingHOC(JobPostingCandidateRequirements, { step: 2 });
