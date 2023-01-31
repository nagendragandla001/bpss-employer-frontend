/* eslint-disable react-hooks/rules-of-hooks */
import dynamic from 'next/dynamic';
import React from 'react';
import { OrganizationDetailsType } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

const MobileFacetoFace = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/MobileFacetoFace'), { ssr: false });

interface interviewI{
  viewmodal:boolean,
  closeModal:()=>void;
  store:OrganizationDetailsType;
  applicationId:string;
  jobId:string;
  invite:any;
  updateApplicationData:any;
  jobtype:string;
  clevertype:string;

}
const MobileScheduleInterview = (props: interviewI): JSX.Element => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {
    viewmodal, closeModal, store, applicationId, jobId, invite, updateApplicationData,
    jobtype, clevertype,
  } = props;

  const handleinvite = (msg, data?, address?):void => {
    invite(msg, data, address);
  };
  return (
    <>

      <MobileFacetoFace
        visible={viewmodal}
        applicationId={applicationId}
        closeModal={closeModal}
        store={store}
        jobId={jobId}
        invite={handleinvite}
        jobtype={jobtype}
        updateApplicationData={updateApplicationData}
        clevertype={clevertype}
      />

    </>
  );
};
export default MobileScheduleInterview;
