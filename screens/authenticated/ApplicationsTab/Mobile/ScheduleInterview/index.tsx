/* eslint-disable no-nested-ternary */
import React from 'react';
import dynamic from 'next/dynamic';
import { CMSInterface, OrganizationDetailsType } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

const SuggestSlots = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/suggestSlots'), { ssr: false });
const AddSlotsIntro = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/addSlotsIntro'), { ssr: false });
interface recommmendTemplatesType{
  interviewStartTime: string;
  interviewEndTime: string;
  interviewDuration: number;
  templateId: number;
  SortedInterviewDates: Array<{date: string; day: string}>;
  interviewType: string;
  suggestedTo: number;

}
interface PropsInterface{
  orgDetails:OrganizationDetailsType;
  onCloseHandler: ()=>void;
  applicationId: string;
  jobId: string;
  jobType: string;
  recommmendTemplates: recommmendTemplatesType|null;
  updateApplicationData:any;
  clevertype:string;
  cms: CMSInterface;
}

const ScheduleInterview = (props: PropsInterface):JSX.Element => {
  const {
    orgDetails, applicationId,
    jobId,
    jobType,
    onCloseHandler,
    recommmendTemplates,
    updateApplicationData,
    clevertype, cms,
  } = props;

  // const [spin, setspin] = useState(true);
  // const slotTemplates = async ():Promise<void> => {
  //   const res = await slotTemplatesAPI(orgDetails.id);
  //   const response = await res.json();
  //   console.log(response);
  //   if (jobId in response) {
  //     const suggestSlots = response[jobId];

  //     setSuggestSlotsDetails(suggestSlots);
  //     setspin(false);
  //   } else { setspin(false); }
  // };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => { slotTemplates(); }, []);
  return (
    <>
      {recommmendTemplates
        ? (
          <SuggestSlots
            visible
            closehandler={onCloseHandler}
            slotsDetails={recommmendTemplates}
            jobType={jobType}
            applicationId={applicationId}
            store={orgDetails}
            jobId={jobId}
            updateApplicationData={updateApplicationData}
            clevertype={clevertype}
            cms={cms}
          />
        ) : (
          <AddSlotsIntro
            visible
            closehandler={onCloseHandler}
            store={orgDetails}
            applicationId={applicationId}
            jobId={jobId}
            jobType={jobType}
            updateApplicationData={updateApplicationData}
            clevertype={clevertype}
          />
        )}

    </>
  );
};

export default ScheduleInterview;
