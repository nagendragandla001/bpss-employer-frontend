import React from 'react';
import { NextPage } from 'next';
import JobPostingHOC from 'lib/jobPostingHOC';
import { JobPostingPagePropsType } from 'common/commonInterfaces';
import dynamic from 'next/dynamic';

const JobPostingStep4 = dynamic(() => import('screens/authenticated/jobPostingStep4/JobPostingStep4.component'));

const jobPostingStep4: NextPage<JobPostingPagePropsType> = (props: JobPostingPagePropsType) => {
  const {
    store, form, userDetails, orgstore,
  } = props;
  return (
    <JobPostingStep4
      store={store}
      form={form}
      userDetails={userDetails}
      orgstore={orgstore}
    />
  );
};

export default JobPostingHOC(jobPostingStep4, { step: 4 });
