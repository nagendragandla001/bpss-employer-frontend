import { FormInstance } from 'antd/lib/form';
import JobPostingHOC from 'lib/jobPostingHOC';
import { NextPage } from 'next';
import React from 'react';
import JobPostFormReviewComponent from 'screens/authenticated/JobPostingForm/ReviewJobForm';

interface PropsInterface {
  form: FormInstance;
  userDetails: any;
  orgStore: any;
  isNewUser: boolean;
}

const JobPostingReviewJob: NextPage<PropsInterface> = (props: PropsInterface) => {
  const {
    form, userDetails, orgStore, isNewUser,
  } = props;

  return (
    <JobPostFormReviewComponent
      form={form}
      userDetails={userDetails}
      orgStore={orgStore}
      isNewUser={isNewUser}
    />
  );
};

export default JobPostingHOC(JobPostingReviewJob, { step: 3 });
