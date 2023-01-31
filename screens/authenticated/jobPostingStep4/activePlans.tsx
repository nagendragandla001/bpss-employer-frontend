/* eslint-disable import/no-cycle */
import {
  Button, Col, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import router from 'routes';
import {
  JobPostingStep4StateType, PricingPlanType, PricingStatsType,
} from 'screens/authenticated/jobPostingStep4/commonTypes';
import { upgradeJob } from 'service/job-service';
import { getOrgPricingStats } from 'service/organization-service';
import { JobPost } from 'stores/index';
import { logEvent } from 'utils/analytics';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/jobPostingStep4/activePlans.less');

const { Title, Text } = Typography;

interface PropsInterface {
  orgId: string;
  orgPricingStats: PricingStatsType | undefined;
  setState: React.Dispatch<React.SetStateAction<JobPostingStep4StateType>>;
  jobStore: JobPost;
  continueAsFreeHandler: () => void;
  currentPlan: PricingPlanType | undefined;
}

const ActivePlans = (props: PropsInterface): JSX.Element => {
  const {
    orgId, jobStore, orgPricingStats, continueAsFreeHandler, currentPlan,
  } = props;
  const [state, setState] = useState({
    remainingCredits: 0,
    upgraded: false,
  });

  const logPricingSubmitEvent = (): void => {
    const trackObj = {
      category: 'job_post',
      action: 'pricing_plan_submit',
      label: 'pricing_plan',
      nonInteraction: false,
    };
    logEvent(trackObj);
  };

  const upgradeToJp = async (): Promise<void> => {
    logPricingSubmitEvent();
    pushClevertapEvent('Job pricing plan chosen', { Type: 'PREMIUM' });
    const apiCall = await upgradeJob({ job_ids: [jobStore.id], plan_id: currentPlan?.id });
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      const apiCall2 = await getOrgPricingStats(orgId);
      const response = await apiCall2.data;
      if (!!response && response?.pricing_stats?.total_pricing_stats?.FJ) {
        props.setState((prevState) => ({ ...prevState, upgraded: true }));
        setState((prevState) => ({
          ...prevState,
          remainingCredits: response?.pricing_stats?.total_pricing_stats?.FJ?.remaining,
          upgraded: true,
        }));
        jobStore.updatePricingPlanType('JP');
      }
    }
  };

  return (
    <Row className="active-plans-page">
      <Col span={24}>
        {state.upgraded ? (
          <div className="upgrade-success-container text-gray-light" style={{ textAlign: 'center' }}>
            <Title level={3} className="p-top-">Congratulations!</Title>
            <CustomImage src="/images/job-posting/pricingPlan.png" layout alt="pricing plan" className="p-bottom-md p-top-1em" />
            <p style={{ lineHeight: '1.6' }}>
              {`
            You have successfully upgraded ‘${jobStore.aboutJob.basicInfo.title}’ Job to Promoted Job Posting.`}
            </p>
            <p className="p-top-1em p-bottom-sm">
              {`${state.remainingCredits} Promoted Job Postings remaining for your account.`}
            </p>
            <Button
              className="text-semibold"
              type="primary"
              onClick={(): void => {
                logPricingSubmitEvent();
                router.Router.pushRoute('MyJobs');
              }}
            >
              My Jobs
            </Button>
          </div>
        ) : (
          <>
            {/* Page Title */}
            <Row>
              <Col xs={{ span: 24, offset: 0 }} lg={{ span: 11, offset: 7 }} className="page-title">
                <Title level={4}>Feature your job</Title>
              </Col>
              <Col xs={{ span: 24, offset: 0 }} lg={{ span: 11, offset: 7 }} className="plan-info">
                <Row className="title" align="middle">
                  <Col span={5}>
                    <CustomImage
                      src="/images/pricing-plan/money-icon.png"
                      width={80}
                      height={50}
                      alt="Featured Job"
                    />
                  </Col>
                  <Col span={12}>
                    <CustomImage
                      className="feature-job-icon"
                      src="/images/pricing-plan/FJ.svg"
                      width={13}
                      height={24}
                      alt="Featured Job"
                    />
                    <Text className="text-white text-large p-left-16">
                      {orgPricingStats?.pricing_stats.total_pricing_stats.FJ?.remaining}
                      {' '}
                      Promoted Job Posts Left
                    </Text>
                  </Col>
                </Row>
                <Row className="plan-details">
                  <Col span={24} className="title-container">
                    <Text className="text-medium text-bold">Do you want to post it as a promoted job?</Text>
                  </Col>
                  <Col span={24} className="m-top-4">
                    <Text className="description">Get 3X Applications by promoting this job</Text>
                  </Col>
                  <Col span={24} className="active-plan-actions">
                    <Button
                      type="primary"
                      className="feature-job-btn"
                      size="small"
                      icon={(
                        <CustomImage
                          src="/images/pricing-plan/trending-up.svg"
                          width={17}
                          height={10}
                          alt="Feature job"
                        />
                      )}
                      onClick={upgradeToJp}
                    >
                      Promote this job
                    </Button>
                    <Button
                      type="link"
                      className="free-job-btn"
                      onClick={():void => {
                        logPricingSubmitEvent();
                        continueAsFreeHandler();
                      }}
                    >
                      Continue without featuring the job
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        )}
      </Col>
    </Row>
  );
};

export default ActivePlans;
