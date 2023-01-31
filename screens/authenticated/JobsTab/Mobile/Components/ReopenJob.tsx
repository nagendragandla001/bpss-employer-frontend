import React from 'react';
import { Col, Row } from 'antd';
import dayjs from 'dayjs';
import CustomImage from 'components/Wrappers/CustomImage';
import JobExpiry from 'screens/authenticated/JobsTab/Mobile/JobExpiry';

type PropsType = {
  isPaused: boolean,
  pricingPlanType: string,
  validTill: string,
  remainingFreeCredits: number,
  remainingJPCredits: number,
  loggedInUserId: string,
  jobId: string,
  postedOn: string,
  jobTitle: string,
  updateJobsData: (validTill: string, jobId: string) => void,
  orgId: string
}

const ReOpenJob = (props: PropsType): JSX.Element => {
  const {
    isPaused, pricingPlanType,
    validTill, remainingFreeCredits,
    remainingJPCredits, loggedInUserId,
    jobId, postedOn, updateJobsData, jobTitle, orgId,
  } = props;

  return (
    <Col span={24} style={{ marginTop: 16 }}>
      <Row className="m-jt-paused-tab-banner" justify="space-between">
        <Col>
          <Row>
            <Col className="m-v-auto"><CustomImage src="/svgs/m-pause-icon.svg" width={32} height={32} alt="Pause" /></Col>
            <Col className="m-v-auto">
              This job is on
              {' '}
              <span className="text-bold">Pause</span>
            </Col>
          </Row>
        </Col>
        <Col className="m-v-auto">
          <JobExpiry
            isPaused
            validTill={validTill}
            pricingPlanType={pricingPlanType}
            remainingFreeCredits={remainingFreeCredits}
            remainingJPCredits={remainingJPCredits}
            loggedInUserId={loggedInUserId}
            jobId={jobId}
            postedOn={dayjs(postedOn).format('DD MMM YYYY')}
            jobTitle={jobTitle}
            updateJobsData={updateJobsData}
            orgId={orgId}
          />
        </Col>
      </Row>
    </Col>
  );
};

export default ReOpenJob;
