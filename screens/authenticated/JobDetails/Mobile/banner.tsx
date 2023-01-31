/* eslint-disable no-nested-ternary */
import { Loading3QuartersOutlined, RightOutlined } from '@ant-design/icons';
import {
  Button, Card, Col, notification, Row, Spin, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import dayjs from 'dayjs';
import { UserDetailsType } from 'lib/authenticationHOC';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { patchJobClose } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import { JobDetailsType } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { banners } from 'screens/authenticated/JobDetails/Common/jobDetailsConstants';
import { getPausedDate } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';

const MobileJPGuideLines = dynamic(() => import('components/Guidelines/Mobile/MobileJPGuideLines'), { ssr: false });
const JobExpiryModal = dynamic(() => import('screens/authenticated/JobsTab/Mobile/JobExpiry/jobExpiryModal'), { ssr: false });

// images of different sizes
const { Paragraph } = Typography;

type PropsModel = {
  status: string,
  expiryDate: string,
  id: string,
  patchrequest: (msg) => void,
  job: any,
  userDetails: UserDetailsType | null
  remainingFreeCredits: number,
  remainingJPCredits: number
  orgId: string
}

const JobDetailsMobileBanners = (props: PropsModel): JSX.Element => {
  const {
    status, expiryDate, patchrequest, id, job,
    userDetails, remainingJPCredits, remainingFreeCredits, orgId,
  } = props;
  const [submitInProgress, setsubmitInProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unApprovedModel, setUnApprovedModel] = useState(false);
  const [pausedWarning, setPausedWarning] = useState(false);

  const handleClose = async (): Promise<void> => {
    setLoading(true);
    setsubmitInProgress(true);
    const apiCall = await patchJobClose(id);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setsubmitInProgress(false);
      patchrequest('success');
      setLoading(false);
    } else {
      setsubmitInProgress(false);
      setLoading(false);
    }
  };

  const handleStatus = (): void => {
    // console.log('status:', status);
    if (status === 'open' || status === 'premiumPromotion') {
      handleClose();
    } else if (status === 'unApproved') {
      setUnApprovedModel(true);
      pushClevertapEvent('Special Click', { Type: 'Know More Unapproved Job' });
    } else if (status === 'pausedWarning' || status === 'paused') {
      setPausedWarning(true);
    } else if (status === 'rejected') {
      pushClevertapEvent('Special Click', { Type: 'Know More Rejected Job' });
    }
  };

  return (
    <Card
      key="jp-actions"
      className={banners[status || 'open'].className}
    >
      <Row>
        <Col span={3} className="m-v-auto">
          <CustomImage
            src={banners[`${status || 'open'}`].icon}
            alt={banners[status || 'open'].key}
            width={32}
            height={32}
          />
        </Col>
        <Col span={21} className="m-v-auto">
          <Row justify="space-between" align="middle">
            <Col>
              <Paragraph className="text-small">
                {banners[status || 'open'].text}
                {' '}
                {
                  status === 'pausedWarning'
                    ? (job.featuredUntil.length > 0 ? getPausedDate(job.expired, job.featuredUntil)
                      : job.expired)
                    : <span className="text-bold">{banners[status || 'open'].status}</span>
                }
              </Paragraph>
            </Col>
            {
              !loading ? (
                banners[status]?.action && (
                  <Col>
                    <Button
                      type="link"
                      className="text-bold text-small p-all-0 job-state-btn"
                      onClick={handleStatus}
                      loading={submitInProgress}
                    >
                      {banners[status || 'open'].action.label}
                      <RightOutlined className="m-right-arrow" />
                    </Button>
                  </Col>
                )
              ) : (
                <Spin indicator={<Loading3QuartersOutlined style={{ fontSize: '1.5rem' }} spin />} />
              )
            }
          </Row>
        </Col>
      </Row>
      {
        unApprovedModel && (
          <MobileJPGuideLines
            visible={unApprovedModel}
            updateVisible={(): void => setUnApprovedModel(false)}
          />
        )
      }
      {
        pausedWarning && (
          <JobExpiryModal
            isPaused={status === 'paused'}
            validTill={job.featuredUntil.length > 0
              ? getPausedDate(job.expired, job.featuredUntil)
              : job.expired}
            pricingPlanType={job.pricingPlanType}
            jobId={job.id}
            postedOn={dayjs(job.createdDate).format('DD MMM YYYY')}
            jobTitle={job.title}
            onCancel={(): void => setPausedWarning(false)}
            loggedInUserId={userDetails?.userId || ''}
            updateJobsData={patchrequest}
            remainingFreeCredits={remainingFreeCredits}
            remainingJPCredits={remainingJPCredits}
            orgId={orgId}
          />
        )
      }
    </Card>
  );
};

export default JobDetailsMobileBanners;
