import React from 'react';
import { Col, Row } from 'antd';
import dayjs from 'dayjs';
import CustomImage from 'components/Wrappers/CustomImage';
import { getPausedDate, JobType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import JobExpiry from 'screens/authenticated/JobsTab/Mobile/JobExpiry';

type PropsType = {
  job: JobType;
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
  orgId: string,
}

const PausedWarning = (props: PropsType): JSX.Element => {
  const {
    job, isPaused, pricingPlanType,
    validTill, remainingFreeCredits,
    remainingJPCredits, loggedInUserId,
    jobId, postedOn, updateJobsData, jobTitle, orgId,
  } = props;

  return (
    <Col span={24} style={{ marginTop: 16 }}>
      <Row className="m-jt-pause-banner">
        <Col style={{ margin: 'auto 0' }}>
          <CustomImage
            src="/images/jobs-tab/m-clock.svg"
            alt="Pause"
            width={32}
            height={32}
          />
        </Col>
        <Col span={15} style={{ margin: 'auto 0' }}>
          The job will pause on
          {' '}
          {job.featuredUntil.length > 0 ? getPausedDate(job.validTill, job.featuredUntil)
            : validTill}
        </Col>
        <Col span={6} style={{ margin: 'auto 0' }}>
          <JobExpiry
            isPaused={isPaused}
            validTill={job.featuredUntil.length > 0
              ? getPausedDate(job.validTill, job.featuredUntil)
              : validTill}
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

export default PausedWarning;
