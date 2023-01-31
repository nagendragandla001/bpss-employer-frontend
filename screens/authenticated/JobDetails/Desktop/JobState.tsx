import {
  Button,
  Card, Col, Row, Typography,
} from 'antd';
import React, { useState, useEffect } from 'react';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import dayjs from 'dayjs';
import JobExpiryModal from 'screens/authenticated/JobsTab/Desktop/jobExpiry';
import { getPausedDate, OrgDetailsType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { UserDetailsType } from 'lib/authenticationHOC';
import { pushClevertapEvent } from 'utils/clevertap';
import JobPostingGuidelines from 'components/JobPostingGuidelinesModal';
import { getLoggedInUser } from 'service/accounts-settings-service';

const { Text, Paragraph } = Typography;

interface IJobState {
  job: IJobPost;
  remainingFreeCredits:number;
  remainingJPCredits:number;
  orgDetails: OrgDetailsType;
  userDetails: UserDetailsType | null;
  updateJobsData:(validTill: string, jobId: string) => void;
  callAction: (type) => void;
}

const JobState = (props: IJobState): JSX.Element => {
  const {
    job, remainingFreeCredits, remainingJPCredits,
    orgDetails, userDetails, updateJobsData, callAction,
  } = props;

  const [openModal, setOpenModal] = useState(false);
  const [userId, setUserId] = useState('');

  const fetchUserInfo = async (): Promise<void> => {
    const apiCallUser = await getLoggedInUser();
    if ([200, 201, 202].includes(apiCallUser.staus)) {
      if (apiCallUser?.data?.objects?.length > 0) {
        setUserId(apiCallUser?.data?.objects[0].id);
      }
    }
  };

  useEffect(() => {
    if (!userDetails) {
      fetchUserInfo();
    } else {
      setUserId(userDetails.userId);
    }
  }, [userDetails]);

  const OpenJob = (): JSX.Element => (
    <Card className="jd-side-layout-card">
      <Row gutter={[10, 10]}>
        <Col span={24}>
          <Row align="middle">
            <Col span={3}>
              <CustomImage
                src="/images/job-details/jd-open.svg"
                alt="active-tag"
                width={30}
                height={44}
              />
            </Col>
            <Col span={20}>
              <Paragraph>
                <Text>This Job is now </Text>
                <Text className="text-bold">Open & Live</Text>
              </Paragraph>
              {/* <Paragraph style={{ color: '#828FA8', fontSize: '10px' }}>
                The job will pause on 25 Aug 2020
              </Paragraph> */}
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Button
            className="br-4"
            block
            type="primary"
            onClick={(): void => callAction('close')}
          >
            Close
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const ClosedJob = (): JSX.Element => (
    <Card className="jd-side-layout-card">
      <Row gutter={[10, 10]}>
        <Col span={24}>
          <Row align="middle">
            <Col span={3}>
              <CustomImage
                src="/images/jobs-tab/closed-icon-24x24.svg"
                alt="active-tag"
                width={30}
                height={44}
              />
            </Col>
            <Col span={20}>
              <Paragraph>
                <Text>This Job is now </Text>
                <Text className="text-bold">Closed</Text>
              </Paragraph>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );

  const PausedJob = (): JSX.Element => (
    <Card className="jd-side-layout-card">
      <Row gutter={[10, 10]}>
        <Col span={24}>
          <Row align="middle">
            <Col span={3}>
              <CustomImage
                src="/images/jobs-tab/paused-icon-24x24.svg"
                alt="active-tag"
                width={30}
                height={44}
              />
            </Col>
            <Col span={20}>
              <Paragraph>
                <Text>The Job is on </Text>
                <Text className="text-bold"> Pause </Text>
              </Paragraph>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <JobExpiryModal
            isPaused
            validTill={job?.expired || ''}
            pricingPlanType={job?.pricingPlanType}
            remainingFreeCredits={remainingFreeCredits}
            remainingJPCredits={remainingJPCredits}
            loggedInUserId={userId}
            jobId={job.id}
            postedOn={job?.created}
            jobTitle={job?.title}
            updateJobsData={updateJobsData}
            pausedOn={job?.paused}
            page
            orgId={orgDetails?.orgId}
          />
        </Col>
      </Row>
    </Card>
  );

  const UnApprovedJob = (): JSX.Element => (
    <Card className="jd-side-layout-card">
      <Row gutter={[10, 10]}>
        <Col span={24}>
          <Row align="middle">
            <Col span={3}>
              <CustomImage
                src="/images/jobs-tab/paused-icon-24x24.svg"
                alt="active-tag"
                width={30}
                height={44}
              />
            </Col>
            <Col span={20}>
              <Paragraph>
                <Text>{`This job ${job?.stage === 'J_R' ? 'was marked ' : 'is still '}`}</Text>
                <Text className="text-bold">{job?.stage === 'J_R' ? 'Rejected' : 'Unapproved'}</Text>
              </Paragraph>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Button
            className="br-4"
            block
            type="primary"
            onClick={():void => {
              setOpenModal(true);
              pushClevertapEvent('Special Click', {
                Type: `${job.stage === 'J_UA' ? 'Know More Unapproved Job'
                  : 'Know More Rejected Job'}`,
              });
            }}
          >
            know more
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const PausedWarningJob = (): JSX.Element => (
    <Card className="jd-side-layout-card">
      <Row gutter={[10, 10]}>
        <Col span={24}>
          <Row align="middle">
            <Col span={3}>
              <CustomImage
                src="/images/jobs-tab/paused-icon-24x24.svg"
                alt="active-tag"
                width={30}
                height={44}
              />
            </Col>
            <Col span={20}>
              <Paragraph>
                <Text>The job will</Text>
                <Text className="text-bold"> pause </Text>
                <Text> on </Text>
                <Text>
                  {' '}
                  {job.featuredUntil.length > 0 ? getPausedDate(job.expired, job.featuredUntil)
                    : job.expired}

                </Text>
              </Paragraph>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <JobExpiryModal
            isPaused={false}
            validTill={job?.expired || ''}
            pricingPlanType={job?.pricingPlanType}
            remainingFreeCredits={remainingFreeCredits}
            remainingJPCredits={remainingJPCredits}
            loggedInUserId={userId}
            jobId={job.id}
            postedOn={job?.created}
            jobTitle={job?.title}
            updateJobsData={updateJobsData}
            pausedOn={job?.paused}
            page
            orgId={orgDetails?.orgId}
          />
        </Col>
      </Row>
    </Card>
  );

  return (
    <>
      {
        (job?.state === 'J_O' && job?.stage === 'J_A' && job?.banner !== 'pausedWarning') && (
          <OpenJob />
        )
      }
      {
        job?.state === 'J_C' && (
          <ClosedJob />
        )
      }
      {
        (job?.state === 'J_P' && !(dayjs(job?.expired) >= dayjs(new Date()))) && (
          <PausedJob />
        )
      }
      {
        ['J_UA', 'J_R'].includes(job?.stage) && (
          <UnApprovedJob />
        )
      }
      {
        job?.banner === 'pausedWarning' && (
          <PausedWarningJob />
        )
      }
      {
        openModal && (
          <JobPostingGuidelines
            onCloseHandler={():void => setOpenModal(false)}
          />
        )
      }
    </>
  );
};

export default JobState;
