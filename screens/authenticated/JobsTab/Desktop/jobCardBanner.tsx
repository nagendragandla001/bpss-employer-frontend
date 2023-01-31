import { InfoCircleFilled, RightOutlined } from '@ant-design/icons';
import {
  Button, Col, Row, Tooltip, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import dayjs from 'dayjs';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { getPausedDate, JobType, OrgDetailsType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import JobExpiryModal from './jobExpiry';

const { Text } = Typography;

interface IProps{
  job: JobType,
  currentTab: string,
  user: any,
  setDrawerAndModalInfo: (any) => void,
  setUnverifiedModalFlag: (value: boolean) => void,
  remainingFreeCredits: number;
  remainingJPCredits: number;
  loggedInUserId: string;
  updateJobsData: (validTill: string, jobId: string) => void;
  orgDetails: OrgDetailsType;
  featureJobHandler: (jobId: any, planType: any) => Promise<void>;
}

const JobCardBanner = (props: IProps) : JSX.Element => {
  const {
    job, currentTab, user, setDrawerAndModalInfo, setUnverifiedModalFlag,
    remainingFreeCredits, remainingJPCredits, loggedInUserId,
    updateJobsData, orgDetails, featureJobHandler,
  } = props;
  const {
    stage, banner, validTill, pricingPlanType,
    id, postedOn, title, pausedOn, featuredUntil,
  } = job;
  if (currentTab === 'drafts') return <></>;
  if (currentTab === 'unapproved') {
    return (
      <Row className="banner background-red-banner" align="middle" justify="space-between">
        <Col style={{ display: 'flex', alignItems: 'center' }}>
          <CustomImage
            src="/images/jobs-tab/unapproved-icon-24x24.svg"
            alt="unapproved icon"
            width={24}
            height={24}
            className="padding-right-8"
          />
          <Text className="text-small">
            {`This job ${stage === 'J_R' ? 'was marked ' : 'is still '}`}
            <Text className="color-red-8 font-bold">
              {stage === 'J_R' ? 'Rejected' : 'Unapproved'}
            </Text>
            <Text>
              {stage === 'J_R' ? '' : ' Our team will approve it shortly.'}
            </Text>
          </Text>
        </Col>
        <Col>
          {/* {emailVerified */}
          {/* eslint-disable-next-line no-nested-ternary */}
          {!user ? <></>
            : (user.email_verified
              ? (
                <Button
                  type="link"
                  onClick={():void => {
                    setDrawerAndModalInfo((prevState) => ({
                      ...prevState,
                      type: 'jobPostingGuidelinesModal',
                      visible: true,
                    }));
                    pushClevertapEvent('Special Click',
                      {
                        Type: `Know More - ${stage === 'J_R' ? 'Rejected' : 'Unapproved'}`,
                        'Job State': currentTab,
                        'Job Type': pricingPlanType,
                      });
                  }}
                  className="link-btn"
                >
                  Know more
                  <RightOutlined style={{
                    fontSize: '12px', fontWeight: 'bold', margin: 0,
                  }}
                  />
                </Button>
              )
              : (
                <Button
                  className="verify-contact-btn"
                  onClick={(): void => {
                    pushClevertapEvent('Verify Contact');
                    setUnverifiedModalFlag(true);
                  }}
                >
                  Verify Contact
                </Button>
              ))}
        </Col>
      </Row>
    );
  }
  if (currentTab === 'open') {
    if (!banner) return <></>;
    if (banner === 'pausedWarning') {
      return (
        <Row className="banner red-banner" align="middle" justify="space-between">
          <Col className="flex-all-center">
            <CustomImage
              src="/images/jobs-tab/watch-icon-24x24.svg"
              height={24}
              width={24}
              alt="watch icon"
            />
            <Text className="text-small">
              The job will on
              <Text className="text-small font-bold">{' pause '}</Text>
              {featuredUntil.length > 0 ? getPausedDate(validTill, featuredUntil) : validTill}
            </Text>
          </Col>
          <Col>
            <JobExpiryModal
              isPaused={false}
              validTill={featuredUntil.length > 0 ? getPausedDate(validTill, featuredUntil)
                : validTill}
              pricingPlanType={pricingPlanType}
              remainingFreeCredits={remainingFreeCredits}
              remainingJPCredits={remainingJPCredits}
              loggedInUserId={loggedInUserId}
              jobId={id}
              postedOn={dayjs(postedOn).format('DD MMM YYYY')}
              jobTitle={title}
              updateJobsData={updateJobsData}
              pausedOn={pausedOn}
              orgId={orgDetails.orgId}
            />
          </Col>
        </Row>
      );
    } if (banner === 'activeTip') {
      return (
        <Row className="banner yellow-banner" align="middle" justify="space-between">
          <Col className="flex-all-center">
            <CustomImage
              src="/images/jobs-tab/light-bulb-icon-24x24.svg"
              alt="light bulb icon"
              className="padding-right-8"
              width={24}
              height={24}
            />
            <Text className="text-small">
              <Text className="text-small font-bold">Tip:</Text>
              {' Call/Shortlist applicants on time to get your job an '}
              <Text className="text-small font-bold">Active Boost</Text>
            </Text>
          </Col>
          <Col>
            <Button
              type="link"
              onClick={():void => {
                setDrawerAndModalInfo((prevState) => ({
                  ...prevState,
                  type: 'activeModal',
                  visible: true,
                }));
                pushClevertapEvent('Special Click',
                  {
                    Type: 'Know More - Active Tag',
                    'Job State': currentTab,
                  });
              }}
              className="link-btn"
            >
              Know more
              <RightOutlined style={{
                fontSize: '12px', fontWeight: 'bold', margin: 0,
              }}
              />
            </Button>
          </Col>
        </Row>
      );
    } if (banner === 'premiumPromotion') {
      return (
        <Row className="banner premium-banner" align="middle">
          <Col span={1} className="upgrade-img">
            <CustomImage
              src="/images/jobs-tab/upgrade-banner-blue-icon.png"
              alt="upgrade banner icon"
              width={40}
              height={40}
            />
          </Col>
          <Col className="content" span={23}>
            <Row align="middle" justify="space-between">
              <Col>
                <Text className="text-base color-blue-primary">
                  Need urgent hiring? Promote this job and get more applications
                </Text>
                  &nbsp;
                <Tooltip title="Promoting the job will increase its visibility to the relevant candidates.">
                  <InfoCircleFilled style={{ color: '#1B2D93' }} />
                </Tooltip>
              </Col>
              <Col>
                <Button
                  className="upgrade-btn flex-all-center"
                  onClick={(): Promise<void> => featureJobHandler(id, pricingPlanType)}
                >
                  <CustomImage
                    src="/images/jobs-tab/trending-up-icon.svg"
                    alt="upgrade banner icon"
                    className="padding-right-8"
                    width={24}
                    height={24}
                  />
                  &nbsp;
                  Promote this job
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      );
    }
  }
  return <></>;
};

export default JobCardBanner;
