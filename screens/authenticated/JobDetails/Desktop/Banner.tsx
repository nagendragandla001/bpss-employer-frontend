/* eslint-disable no-nested-ternary */
import {
  Button, Col, Divider, Row, Typography,
} from 'antd';
// import img from 'next/image';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import AppConstants from 'constants/constants';
import { ApiConstants } from 'constants/index';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { getPausedDate } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';

const JobExpiryModal = dynamic(() => import('screens/authenticated/JobsTab/Desktop/jobExpiry'), { ssr: false });
const JobPostingGuidelines = dynamic(() => import('components/JobPostingGuidelinesModal'), { ssr: false });

const { Text } = Typography;
interface bannerI{
  jobData:any
  remainingFreeCredits:number;
  remainingJPCredits:number;
  loggedInUserId:string;
  updateJobsData:(validTill: string, jobId: string) => void;
  orgId:string;
}

const Banner = (props:bannerI):JSX.Element|null => {
  const {
    jobData, remainingFreeCredits, remainingJPCredits, loggedInUserId,
    updateJobsData, orgId,
  } = props;
  const [drawerAndModalInfo, setDrawerAndModalInfo] = useState({
    type: '',
    job: null,
    visible: false,
  });
  const getbanner = ():JSX.Element | null => {
    if (jobData.state === 'J_C') {
      return (
        <Row className="jd-red-banner" align="middle">
          <Col className="flex-all-center" style={{ marginLeft: '7.5rem', marginRight: '0.3rem' }}>
            <div className="padding-right-8">
              <CustomImage
                src="/images/jobs-tab/closed-icon-24x24.svg"
                alt="closed icon"
                className="padding-right-8"
                height={24}
                width={24}
              />
              <Text className="text-small">
                The job is now
                <Text className="text-small font-bold">{' Closed'}</Text>
              </Text>
            </div>
          </Col>
          <Col span={1} />
        </Row>
      );
    }
    if (jobData.state === 'J_P') {
      if ((jobData.expiryDate && dayjs(jobData.expiryDate) >= dayjs(new Date()))) {
        return (<Row align="middle" className="jd-empty-btm" />);
      }

      return (
        <Row className="banner jd-yellow" align="middle" style={{ marginBottom: 20 }}>
          <Container>
            <Row align="middle">
              <Col className="flex-all-center" style={{ marginRight: '0.3rem' }}>
                <div className="padding-right-8" style={{ display: 'inline-flex' }}>
                  <CustomImage
                    src="/images/jobs-tab/paused-icon-24x24.svg"
                    alt="paused icon"
                    className="padding-right-8"
                    height={24}
                    width={24}
                  />
                  <Text className="text-small">
                    The job is on
                    <Text className="text-small font-bold">
                      {' pause    '}
                    </Text>
                  </Text>
                </div>
              </Col>
              <Col style={{ marginBottom: '0.8rem', marginLeft: '0.4rem' }}>
                <JobExpiryModal
                  isPaused
                  validTill={jobData.expiryDate ? jobData.expiryDate : ''}
                  pricingPlanType={jobData.pricingPlanType}
                  remainingFreeCredits={remainingFreeCredits}
                  remainingJPCredits={remainingJPCredits}
                  loggedInUserId={loggedInUserId}
                  jobId={jobData.id}
                  postedOn={dayjs(jobData.createdDate).format('DD MMM YYYY')}
                  jobTitle={jobData.title}
                  updateJobsData={updateJobsData}
                  pausedOn={jobData.pausedDate}
                  page
                  orgId={orgId}
                />
              </Col>
            </Row>
          </Container>
        </Row>
      );
    }
    if (jobData.jobStage === 'J_UA' || jobData.jobStage === 'J_R') {
      return (
        <Row className="jd-red-banner" align="middle" style={{ marginBottom: 20 }}>
          <Container>
            <Row align="middle">
              <Col className="flex-all-center">
                <div className="padding-right-8">
                  <CustomImage
                    src="/images/jobs-tab/unapproved-icon-24x24.svg"
                    alt="unapproved icon"
                    className="padding-right-8"
                    height={24}
                    width={24}
                  />
                  <Text className="text-small">
                    {`This job ${jobData.jobStage === 'J_R' ? 'was marked ' : 'is still '}`}
                    <Text className="jd-red font-bold">{jobData.jobStage === 'J_R' ? 'Rejected' : 'Unapproved'}</Text>
                  </Text>
                </div>
              </Col>
              <Col>
                <Button
                  type="link"
                  onClick={():void => {
                    setDrawerAndModalInfo((prevState) => ({
                      ...prevState,
                      type: 'jobPostingGuidelinesModal',
                      visible: true,
                    }));
                    pushClevertapEvent('Special Click', {
                      Type: `${jobData.jobStage === 'J_UA' ? 'Know More Unapproved Job'
                        : 'Know More Rejected Job'}`,
                    });
                  }}
                  className="link-btn-blue"
                >
                  know more
                  <CustomImage
                    src="/images/job-details/right-job-detail.svg"
                    width={16}
                    height={16}
                    alt="right"
                  />
                </Button>
              </Col>
            </Row>
          </Container>
        </Row>
      );
    }
    if (jobData.banner === 'pausedWarning') {
      return (
        <Row className="banner" align="middle" style={{ marginBottom: 20 }}>
          <Container>
            <Row align="middle">
              <Col className="flex-all-center" style={{ marginRight: '0.3rem' }}>
                <div className="padding-right-8" style={{ display: 'inline-flex' }}>
                  <CustomImage
                    src="/images/jobs-tab/watch-icon-24x24.svg"
                    width={24}
                    height={24}
                    alt="watch icon"
                  />
                  <Text>
                    The job will
                    <Text className="text-small font-bold">{' pause '}</Text>
                    {' on '}
                    {jobData.featuredUntil.length > 0 ? getPausedDate(jobData.expired,
                      jobData.featuredUntil)
                      : jobData.expired}

                  </Text>
                </div>

              </Col>
              <Col style={{ marginBottom: '0.8rem', marginLeft: '0.4rem' }}>
                {'   '}
                <JobExpiryModal
                  isPaused={false}
                  validTill={jobData.expiryDate ? jobData.expiryDate : ''}
                  pricingPlanType={jobData.pricingPlanType}
                  remainingFreeCredits={remainingFreeCredits}
                  remainingJPCredits={remainingJPCredits}
                  loggedInUserId={loggedInUserId}
                  jobId={jobData.id}
                  postedOn={dayjs(jobData.createdDate).format('DD MMM YYYY')}
                  jobTitle={jobData.title}
                  updateJobsData={updateJobsData}
                  pausedOn={jobData.pausedDate}
                  page
                  orgId={orgId}
                />
              </Col>
              <Col style={{ marginLeft: '13rem' }}>
                <span style={{ fontWeight: 'bold', color: 'black' }}> Share on:</span>
                <a target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${config.BASE_URL}/job/${jobData?.jobslug}/${jobData?.id}/&title=${encodeURI(`Apply for ${jobData.title} Jobs in ${jobData.organizationPopularName || jobData.organizationName} | ${jobData.locations[0].city} - ${AppConstants.APP_NAME}.com`)}`}>
                  {' '}
                  <div className="vertical-img jd-margin">
                    <Button
                      type="link"
                      onClick={():void => {
                        pushClevertapEvent('Share Job', { Type: 'Linkedin', JobState: `${jobData.jobState}` });
                      }}
                      icon={(
                        <CustomImage
                          src="/images/job-details/jd-fb-ic.svg"
                          alt="linkedin"
                          width={24}
                          height={24}
                        />
                      )}

                    />
                  </div>
                </a>
                <a type="link" target="_blank" rel="noopener noreferrer" href={`${ApiConstants.FACEBOOK_SHARE_LINK}job/${jobData?.jobslug}/${jobData?.id}`}>

                  {' '}
                  <div className="vertical-img jd-margin">
                    <Button
                      type="link"
                      onClick={():void => {
                        pushClevertapEvent('Share Job', { Type: 'Facebook', JobState: `${jobData.jobState}` });
                      }}
                      icon={(
                        <CustomImage
                          src="/images/job-details/jd-linkedin-ic.svg"
                          alt="fb"
                          width={24}
                          height={24}
                        />
                      )}
                    />
                  </div>
                </a>
                <a type="link" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${config.BASE_URL}/job/${jobData?.jobslug}/${jobData?.id}/&text=${encodeURI(`Apply for ${jobData.title} Jobs in ${jobData.organizationPopularName || jobData.organizationName} | ${jobData.locations[0].city} - ${AppConstants.APP_NAME}.com`)}`}>

                  {' '}
                  <div className="vertical-img jd-margin">
                    <Button
                      type="link"
                      onClick={():void => {
                        pushClevertapEvent('Share Job', { Type: 'Twitter', JobState: `${jobData.jobState}` });
                      }}
                      icon={(
                        <CustomImage
                          src="/images/job-details/jd-tw-ic.svg"
                          alt="twitter"
                          width={24}
                          height={24}
                        />
                      )}

                    />
                  </div>
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`mailto: ?&subject=Apply for ${jobData?.title} in ${jobData.organizationPopularName || jobData.organizationName} | ${jobData.locations[0].city} - ${AppConstants.APP_NAME}.com&body= Apply for ${jobData.title} Jobs in ${jobData.organizationPopularName || jobData.organizationName}  | ${jobData.locations[0].city} - ${AppConstants.APP_NAME}.com${config.BASE_URL}/job/${jobData?.jobslug}/${jobData?.id}`}
                >
                  <div className="vertical-img jd-margin">
                    <Button
                      type="link"
                      onClick={():void => {
                        pushClevertapEvent('Share Job', { Type: 'Mail', JobState: `${jobData.jobState}` });
                      }}
                      icon={(
                        <CustomImage
                          src="/images/job-details/jd-mail.svg"
                          alt="email"
                          width={24}
                          height={24}
                        />
                      )}

                    />
                  </div>
                </a>
              </Col>
              <Divider className="divider-clr" style={{ minWidth: '100px', marginTop: '5px' }} />
            </Row>
          </Container>
        </Row>
      );
    }
    return null;
  };

  return (
    <>
      <Row justify="space-between">
        <Col flex={5}>
          {getbanner()}
        </Col>
      </Row>
      {drawerAndModalInfo.type === 'jobPostingGuidelinesModal'
        ? (
          <JobPostingGuidelines
            onCloseHandler={():void => setDrawerAndModalInfo({ type: '', visible: false, job: null })}
          />
        ) : null}
    </>
  );
};
export default Banner;
