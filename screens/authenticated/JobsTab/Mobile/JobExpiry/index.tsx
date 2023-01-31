import React, { useState } from 'react';
import {
  Row, Col, Button,
} from 'antd';
import RightOutlined from '@ant-design/icons/RightOutlined';
import dayjs from 'dayjs';
import JobExpiryModal from 'screens/authenticated/JobsTab/Mobile/JobExpiry/jobExpiryModal';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobsTab/Mobile/JobExpiry/jobExpiry.less');

type PropsInterface= {
  isPaused: boolean,
  pricingPlanType: string,
  validTill: string,
  jobTitle: string,
  postedOn: string,
  jobId: string,
  remainingFreeCredits: number,
  remainingJPCredits: number,
  loggedInUserId: string,
  updateJobsData: (validTill: string, jobId: string) => void,
  orgId: string,
}

const JobExpiry = (props: PropsInterface): JSX.Element => {
  const {
    isPaused, validTill, pricingPlanType, jobTitle,
    postedOn, jobId, remainingFreeCredits, remainingJPCredits,
    loggedInUserId, updateJobsData, orgId,
  } = props;

  const [visible, setVisible] = useState(false);

  return (
    <Row className="job-expiry-modal-container">
      <Col span={24}>
        <Button
          type="link"
          onClick={(): void => {
            setVisible(true);
            pushClevertapEvent('Special Click', { Type: 'Know More - Paused Job' });
          }}
          className="link-btn-blue p-all-0"
        >
          {isPaused ? 'Renew Job' : 'know more'}
          <RightOutlined className="right-arrow" />
        </Button>
      </Col>
      {
        visible && (
          <JobExpiryModal
            isPaused={isPaused}
            validTill={validTill}
            pricingPlanType={pricingPlanType}
            remainingFreeCredits={remainingFreeCredits}
            remainingJPCredits={remainingJPCredits}
            loggedInUserId={loggedInUserId}
            jobId={jobId}
            postedOn={dayjs(postedOn).format('DD MMM YYYY')}
            jobTitle={jobTitle}
            updateJobsData={updateJobsData}
            onCancel={(): void => setVisible(false)}
            orgId={orgId}
          />
        )
      }
    </Row>
  );
};

export default JobExpiry;
