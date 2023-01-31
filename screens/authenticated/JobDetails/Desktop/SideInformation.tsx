import {
  Col, FormInstance, Row,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import { UserDetailsType } from 'lib/authenticationHOC';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import JobState from 'screens/authenticated/JobDetails/Desktop/JobState';
import { PricingStatsType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import {
  getOrganisationDetails, getPricingStats, OrgDetailsType,
} from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { getWhatsAppSubscription, subscribeToWhatsApp } from 'service/accounts-settings-service';
import { upgradeJob } from 'service/job-service';
import { pushClevertapEvent } from 'utils/clevertap';
import CallHR from './CallHR';
import CompletionScore from './CompletionScore';
import InterviewSlots from './InterviewSlots';
import InterviewType from './InterviewType';
import Promotions from './Promotions';
import ShareMedia from './ShareMedia';

interface ISideInformation {
  job: IJobPost;
  userDetails: UserDetailsType | null;
  patchrequest: (status) => void;
  updateJobsData: (validDate, id) => void;
  callAction: (type) => void;
  updateCallHRHandler: (data) => void;
  updatePOCHandler: (data) => void;
  form: FormInstance,
}

const SideInformation = (props: ISideInformation): JSX.Element => {
  const {
    job,
    patchrequest, userDetails, updateJobsData, callAction, updateCallHRHandler, updatePOCHandler,
    form,
  } = props;
  const [pricingStats, setPricingStats] = useState<PricingStatsType>();
  const [orgDetails, setOrgDetails] = useState<OrgDetailsType>({
    orgId: '',
    offices: [],
    managers: [],
    contactsUnlocksLeft: 0,
  });
  const [callHRWhatsapp, setCallHRWhatsapp] = useState({
    state: false,
    loading: false,
  });
  const [userId, setUserId] = useState('');

  const updateFeatureJobHandler = async (): Promise<void> => {
    pushClevertapEvent('Special Click',
      { Type: 'Feature Job', JobId: `${job.id}` });

    if (job?.pricingPlanType === 'FR'
    && pricingStats?.pricing_stats?.total_pricing_stats?.FJ?.remaining
    ) {
      const featureApiCall = await upgradeJob({
        job_ids: [job?.id],
        plan_id: pricingStats?.pricing_stats?.plan_wise_pricing_stats?.[0]?.id,
      });
      if ([200, 201, 202].includes(featureApiCall.status)) {
        patchrequest('success');
      }
    } else {
      router.Router.pushRoute('PricingPlans');
    }
  };

  const fetchCallHRWhatsappStatus = async (): Promise<void> => {
    const apiCallUser = await getWhatsAppSubscription(job?.pointOfContacts?.id);
    if ([200, 201, 202].includes(apiCallUser.status)) {
      // setCallHRWhatsapp(apiCallUser?.data?.objects[0].whatsapp_subscribed);
      setCallHRWhatsapp((prev) => ({
        ...prev,
        state: apiCallUser?.data?.whatsapp_subscribed,
      }));
      setUserId(job.pointOfContacts.id);
    }
  };

  const updateCallHRWhatsappStatus = async (value):Promise<void> => {
    setCallHRWhatsapp((prev) => ({
      ...prev,
      loading: true,
    }));
    const apiResponse = await subscribeToWhatsApp(value, userId);
    if ([200, 201, 202].includes(apiResponse.status)) {
      setCallHRWhatsapp((prev) => ({
        ...prev,
        state: value,
        loading: false,
      }));
    } else {
      setCallHRWhatsapp((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  // eslint-disable-next-line consistent-return
  const initPricingAndUnlockInfo = async (): Promise<void|null> => {
    const data = await getOrganisationDetails();
    let pricingData;
    if (data && data.orgId) {
      setOrgDetails(data);
      pricingData = await getPricingStats(data.orgId);
    } else { return null; }

    if (pricingData) {
      if (data) {
        setPricingStats(pricingData);
      }
    }
  };

  useEffect(() => {
    initPricingAndUnlockInfo();
  }, []);

  useEffect(() => {
    fetchCallHRWhatsappStatus();
  }, [job]);

  return (
    <Row gutter={[0, 17]} align="middle">
      <Col span={24}>
        <JobState
          job={job}
          remainingFreeCredits={
            pricingStats?.pricing_stats?.total_pricing_stats?.JP?.remaining || 0
          }
          remainingJPCredits={
            pricingStats?.pricing_stats?.total_pricing_stats?.FJ?.remaining || 0
          }
          orgDetails={orgDetails}
          userDetails={userDetails}
          updateJobsData={updateJobsData}
          callAction={callAction}
        />
      </Col>
      <Col span={24}>
        <InterviewType job={job} />
      </Col>
      {
        job?.clientApprovalRequired && (
          <Col span={24}>
            <InterviewSlots job={job} orgData={orgDetails} updateSlot={patchrequest} />
          </Col>
        )
      }
      <Col span={24}>
        <CallHR
          userDetails={userDetails}
          job={job}
          name={job.pointOfContacts.name}
          mobile={job.pointOfContacts.mobile}
          enabled={job?.shareContact}
          updateCallHRHandler={updateCallHRHandler}
          whatsappSubscribed={callHRWhatsapp}
          updatePOCHandler={updatePOCHandler}
          updatedCallHRWhatsappStatus={updateCallHRWhatsappStatus}
          form={form}
        />
      </Col>
      {
        ['premiumPromotion', 'activeTip'].includes(job.banner) && (
          <Col span={24}>
            <Promotions updateFeatureJob={updateFeatureJobHandler} />
          </Col>
        )
      }
      <Col span={24}>
        <CompletionScore job={job} />
      </Col>
      <Col span={24}>
        <ShareMedia job={job} />
      </Col>
    </Row>
  );
};

export default SideInformation;
