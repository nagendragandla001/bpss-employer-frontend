/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
import {
  Col, Divider, Row, Form, Drawer, Space, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import BasicDetailsReview from 'components/JobDetails/BasicDetailsReview';
import CandidateRequirementReview from 'components/JobDetails/CandidateRequirementReview';
import JobReviewTitle from 'components/JobDetails/JobReviewTitle';
import LocationReview from 'components/JobDetails/LocationReview';
import PocReview from 'components/JobDetails/PocReview';
import SalaryReview from 'components/JobDetails/SalaryReview';
import Container from 'components/Layout/Container';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import { AppConstants } from 'constants/index';
import dayjs from 'dayjs';
import { UserDetailsType } from 'lib/authenticationHOC';
import Head from 'next/head';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import { changeJobState } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import SkeletonCard from 'screens/authenticated/JobDetails/Desktop/skeletondetails';
import { getJobDetailsData, patchJobChangesData } from 'service/job-posting-service';
import { getOrgDetails } from 'service/organization-service';

import {
  preapreBasicDetailsPatchChanges,
  preapreLocationPatchChanges,
  preapreSalaryPatchChanges,
  prepareCallHRPatchChanges,
  prepareCandidateRequirementPatchObj,
  prepareJobRolePatchChanges,
  preparePOCPatchChanges,
} from 'utils';
import CandidatePreview from './CandidatePreview';
import JobDetailsCTA from './JobDetailsCTA';
import PlanBanner from './PlanBanner';
import SideInformation from './SideInformation';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');
require('screens/authenticated/JobPostingForm/ReviewJobForm/ReviewJobForm.less');

const { Text } = Typography;

interface PropsI {
  id: string
  userDetails:UserDetailsType | null;
}
// const initial = true;
const JobDetails = (props: PropsI): JSX.Element => {
  const { id, userDetails } = props;
  const [form] = Form.useForm();

  const [state, setState] = useState<IJobPost>({} as IJobPost);
  const [orgDetails, setOrgDetails] = useState({} as any);

  // const [jobData, setJobData] = useState<JobDetailsType>();
  const [refresh, setrefresh] = useState(false);
  const [candidatePreviewVisible, setCandidatePreviewVisible] = useState(false);
  // const [verifyModal, setverifyModal] = useState(false);

  // const isVerifyModal = async (res): Promise<void> => {
  //   if (res && res.pricingPlanType === 'FR') {
  //     const apiCallUser = await getLoggedInUser();
  //     const userDetailsData = await apiCallUser.data;

  //     const apiCall = await getUserInfo(userDetailsData?.objects[0]?.id, true);
  //     if (apiCall) {
  //       const response = await apiCall.data;
  //       if (response && response.email &&
  // (AppConstants.GENERIC_EMAIL_IDS.includes(response?.email?.split('@')[1])
  // && !response?.mobile_verified)) {
  //         setverifyModal(true);
  //       }
  //     }
  //   }
  // };

  const callAction = async (action): Promise<void> => {
    const res = await changeJobState(state?.id, action);
    if ([200, 201, 202].indexOf(res.status) > -1) {
      setrefresh(!refresh);
    }
  };
  const patchrequest = (msg): void => {
    // console.log(msg);
    if (msg === 'success') { setrefresh(!refresh); }
  };
  const updateJobsData = (validTill:string, jobId:string):void => {
    if (!validTill) return;
    if (validTill && state) {
      const dataCopy = {
        ...state,
        vaildTill: dayjs(validTill).format('DD MMM YYYY'),
        banner: 'activeTip',
      };
      setState(dataCopy);
      // setrefresh(!refresh);
    }
  };

  const fetchJobDetails = async (): Promise<void> => {
    const response = await getJobDetailsData(id);
    if (response) {
      setState(response);
      // if (initial) { isVerifyModal(response); }
    }
  };

  const updateJobRoleChangeHandler = async (data): Promise<void> => {
    const patchObj = prepareJobRolePatchChanges(data);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updateCallHRHandler = async (data): Promise<void> => {
    const patchObj = prepareCallHRPatchChanges(data);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updateBasicDetailsOnEditHandler = async (data): Promise<void> => {
    const patchObj = preapreBasicDetailsPatchChanges(data);

    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };
  const updateLocationOnEditHandler = async (data): Promise<void> => {
    const patchObj = preapreLocationPatchChanges(data);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updateSalryOnEditHandler = async (data): Promise<void> => {
    const patchObj = preapreSalaryPatchChanges(data);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updateCandidateReqDetailsHandler = async (data): Promise<void> => {
    const experience = data.experienceRange ? data.experienceRange.split('-') : [0, 0];
    const formObj = {
      ...data,
      minimumExperience: parseInt(experience[0], 10) * 12,
      maximumExperience: parseInt(experience[1], 10) * 12,
    };
    const patchObj = prepareCandidateRequirementPatchObj(formObj);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updatePOCDetailsHandler = async (data): Promise<void> => {
    const patchObj = preparePOCPatchChanges(data.POCDetails);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const fetchOrgInfo = async (): Promise<void> => {
    const response = await getOrgDetails();
    if ([200, 201, 202].includes(response?.status)) {
      setOrgDetails({
        type: response?.data?.objects?.[0]?._source?.type,
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchJobDetails();
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    fetchOrgInfo();
  }, []);

  // const menuItems = (
  //   <Menu className="jd-dropdown">
  //     <Menu.Item key="open" hidden={jobData?.jobState === 'J_O'}
  // onClick={(): Promise<void> => callAction('open')}>
  //       OPEN
  //     </Menu.Item>
  //     <Menu.Item key="pause" onClick={(): Promise<void> => callAction('pause')}>
  //       PAUSE
  //     </Menu.Item>
  //     <Menu.Item
  //       key="close"
  //       onClick={(): Promise<void> => callAction('close')}
  //       disabled={closeInProgress}
  //     >
  //       CLOSE
  //     </Menu.Item>
  //   </Menu>
  // );
  return (
    <>
      <Head>
        <title>
          {`${state?.title} | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`${state?.title} | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* Maps Start */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${config.MAPS_API_KEY_FRONTEND}&libraries=places`}
      />
      {/* Maps End */}
      {state?.id
        ? (
          <>
            <>
              <Row>
                <Col
                  xs={{ span: 0 }}
                  lg={{ span: 24 }}
                  className="d-jd-review-title"
                >
                  <Container>
                    <UnverifiedEmailNotification />
                    <PlanBanner job={state} />
                    <JobReviewTitle
                      job={state}
                      form={form}
                      updateJob={updateJobRoleChangeHandler}
                      orgDetails={orgDetails}
                    />
                    <JobDetailsCTA
                      job={state}
                      candidatePreviewVisible={candidatePreviewVisible}
                      setCandidatePreview={setCandidatePreviewVisible}
                    />
                  </Container>
                </Col>
              </Row>
              <Container>
                <Row gutter={50} className="d-jd-container">
                  <Col span={16}>
                    <BasicDetailsReview
                      job={state}
                      form={form}
                      updateJob={updateBasicDetailsOnEditHandler}
                    />
                    <Divider />
                    <LocationReview
                      job={state}
                      form={form}
                      updateJob={updateLocationOnEditHandler}
                    />
                    <Divider />
                    <SalaryReview
                      job={state}
                      form={form}
                      updateJob={updateSalryOnEditHandler}
                    />
                    <Divider />
                    <CandidateRequirementReview
                      job={state}
                      form={form}
                      updateJob={updateCandidateReqDetailsHandler}
                    />
                    <Divider />
                    <PocReview
                      job={state}
                      form={form}
                      updateJob={updatePOCDetailsHandler}
                    />
                  </Col>
                  <Col span={8} className="jd-side-information">
                    <SideInformation
                      job={state}
                      userDetails={userDetails}
                      form={form}
                      updateJobsData={updateJobsData}
                      patchrequest={(updateJob): void => { if (updateJob) patchrequest('success'); }}
                      callAction={callAction}
                      updateCallHRHandler={updateCallHRHandler}
                      updatePOCHandler={updatePOCDetailsHandler}
                    />
                  </Col>
                </Row>
              </Container>

              {/* <Row className={jobData?.jobState !== 'J_O' || jobData?.jobStage !== 'J_A' ?
            'jd-close jd-header-row' : 'jd-open jd-header-row'}>
              <Container>
                <UnverifiedEmailNotification />

                <Row>
                  <Card className="jd-header-card">
                    <Row>
                      <Col>
                        {jobData && jobData?.pricingPlanType === 'FR'
                          ? (
                            <>
                              <Col>
                                {(jobData?.activeTag && jobData?.jobState === 'J_O')
                                  ? (
                                    <Text className="jd-active-banner">
                                      ACTIVE
                                      {' '}
                                      <CustomImage
                                        src="/svgs/icon-active.svg"
                                        alt="active-tag"
                                        width={72}
                                        height={20}
                                      />
                                    </Text>
                                  ) : null}
                              </Col>
                            </>
                          ) : (
                            jobData?.pricingPlanType === 'JP'
                              ? (
                                <Col span={24}>
                                  <Text className="jd-premium-banner">
                                    <CustomImage src="/svgs/m-premium.svg"
                                    width={16} height={16} alt="Premium" />
                                    FEATURED
                                    {' '}
                                  </Text>
                                </Col>
                              ) : null)}
                        <Row className="jd-title">
                          <Row style={{ display: 'grid' }}>
                            <Paragraph ellipsis className="text-large font-bold"
                            style={{ maxWidth: '450px' }}>{jobData.title}</Paragraph>
                            <span className="jd-company">
                            {jobData?.hiringOrgName.length > 0 ? jobData?.hiringOrgName :
                              jobData?.organizationPopularName}</span>
                          </Row>
                          <Col className={jobData.jobState === 'J_C' ? 'jd-edit-cancel'
                            : 'hide'}
                          >
                            <Button
                              type="link"
                              icon={(
                                <CustomImage
                                  src="/images/job-details/jd-edit.svg"
                                  alt="edit"
                                  width={18}
                                  height={18}
                                />
                              )}
                              onClick={(): void => { setjobTitle(true); }}
                              className="ct-edit-btn"
                            />
                          </Col>
                        </Row>

                        <JobDetailsCTA job={jobData} />

                        <Row style={{ marginTop: '2rem' }}>
                          {jobData?.id && jobData?.jobState === 'J_O' && jobData?.jobStage === 'J_A'
                            ? (
                              <Button
                                target="blank"
                                className="jd-desktop-preview post-a-job-btn"
                                href={`${config.AJ_URL}job/${jobData?.jobslug}/${jobData?.id}`}
                                onClick={():void => {
                                  pushClevertapEvent('Special Click',
                                  { Type: 'Candidate Preview' });
                                }}
                              >
                                Candidate Preview
                              </Button>
                            ) : null}
                          {jobData?.id ? (
                            <Button
                              className="jd-desktop-preview-application post-a-job-btn"
                              disabled={jobData?.totalApplications === 0}
                              onClick={(): void => handleViewApplications('applications')}
                            >
                              View Applications
                              <Text className="jd-subheading">
                                {' '}
                                <span className="jd-total-app">{jobData?.totalApplications}</span>
                              </Text>
                            </Button>
                          ) : null}
                          {(jobData?.id && jobData?.jobState === 'J_O'
                          && jobData.jobStage === 'J_A') ? (
                            <Button
                              className="jd-desktop-preview-application post-a-job-btn"
                              disabled={recommendData
                                ?.findRecommendedCandidatesForEmployer?.totalCount
                                === 0}
                              onClick={(): void => handleViewApplications('database')}
                            >
                              View Database
                              <Text className="jd-subheading">
                                {' '}
                                <span className="jd-total-app">
                                  {' '}
                                  {(recommendData
                                    ?.findRecommendedCandidatesForEmployer?.totalCount > 50
                                    ? 50 : recommendData
                                      ?.findRecommendedCandidatesForEmployer?.totalCount) || 0}
                                </span>
                              </Text>
                            </Button>
                          ) : null}
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                </Row>
                <Col offset={17} style={{ marginTop: '-10rem' }}>
                  {jobData && slotData ? (
                    <SideLayout
                      jobData={jobData}
                      slotdata={slotData}
                      patchrequest={patchrequest}
                      orgData={orgDetails}
                      verifyModal={verifyModal}
                      loggedInUserDetails={userDetails}
                    />
                  ) : null}
                </Col>
              </Container>
            </Row>
             */}
              {/* <Row>
              {jobData.jobStage === 'J_A' && (jobData.jobState === 'J_O')
              && jobData.banner !== 'pausedWarning'
                ? (
                  <Row align="middle" justify="start">
                    <Col offset={2}>
                      { jobData.banner !== 'pausedWarning'
                        ? (
                          <>
                            <div className="vertical-img">
                              <CustomImage src="/images/job-details/jd-open.svg"
                              width={32} height={32} alt="open" />
                            </div>
                            The job is now
                            <Dropdown
                              className="jd-dropdown-state"
                              overlay={menuItems}
                              trigger={['click']}
                            >
                              <Button type="link">
                                <span style={{ fontWeight: 'bold', color: 'black' }}>
                                  {jobData.jobState === 'J_O' ? 'Open & Live' : 'Pause'}
                                </span>
                                {' '}
                                <CustomImage
                                  src="/images/jobs-tab/dropdown-icon.svg"
                                  width={24}
                                  height={24}
                                  alt="drop-down"
                                />
                              </Button>
                            </Dropdown>
                          </>
                        ) : null }
                    </Col>
                    <Col offset={5}>
                      <span style={{ fontWeight: 'bold', color: '#828fa8' }}> Share on:</span>
                      <a target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${config.BASE_URL}/job/${jobData?.jobslug}/${jobData?.id}/&title=${encodeURI(`Apply for ${jobData.title} Jobs in ${jobData.organizationPopularName || jobData.organizationName} | ${jobData.locations[0].city} - ${AppConstants.APP_NAME}.com`)}`}>

                        {' '}
                        <div className="vertical-img jd-margin">
                          <Button
                            type="link"
                            onClick={():void => {
                              pushClevertapEvent('Share Job',
                              { Type: 'Linkedin', JobState: `${jobData.jobState}` });
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
                      <a type="link" target="_blank" rel="noopener noreferrer"
                      href={`${ApiConstants.FACEBOOK_SHARE_LINK}
                      job/${jobData?.jobslug}/${jobData?.id}`}>

                        {' '}
                        <div className="vertical-img jd-margin">
                          <Button
                            type="link"
                            onClick={():void => {
                              pushClevertapEvent('Share Job',
                              { Type: 'Facebook', JobState: `${jobData.jobState}` });
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
                              pushClevertapEvent('Share Job',
                              { Type: 'Twitter', JobState: `${jobData.jobState}` });
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
                        href={`mailto: ?&subject=Apply for ${jobData?.title} i
                        n ${jobData.organizationPopularName || jobData.organizationName} |
                         ${jobData.locations[0].city} - ${AppConstants.APP_NAME}.com&body= Apply
                         for ${jobData.title} Jobs in ${jobData.organizationPopularName ||
                          jobData.organizationName}  | ${jobData.locations[0].city} -
                          ${AppConstants.APP_NAME}.com${config.BASE_URL}/job/${jobData?.jobslug}
                          /${jobData?.id}`}
                      >
                        <div className="vertical-img jd-margin">
                          <Button
                            type="link"
                            onClick={():void => {
                              pushClevertapEvent('Share Job',
                              { Type: 'Mail', JobState: `${jobData.jobState}` });
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
                    <Divider className="divider-clr" style={{ marginTop: '5px' }} />
                  </Row>
                ) : null}
            </Row>
             */}
              {/* <Banner
              jobData={jobData}
              remainingFreeCredits={pricingStats.remainingFreeCredits}
              remainingJPCredits={pricingStats.remainingJPCredits}
              loggedInUserId={userDetails ? userDetails.userId : ''}
              updateJobsData={updateJobsData}
              orgId={orgDetails.orgId}
            /> */}

              {/* {jobData ? (
              <JobDetailsCard
                data={jobData}
                patchrequestHandler={patchrequest}
              />
            ) : null} */}

              {/* {jobTitle && jobData
              ? (
                <JobTitle
                  visible={jobTitle}
                  data={jobData}
                  onCancel={(): void => { setjobTitle(false); }}
                  patchrequest={patchrequest}
                />
              ) : null} */}

            </>
            {candidatePreviewVisible && (
              <CandidatePreview
                job={state}
                candidatePreviewVisible={candidatePreviewVisible}
                setCandidatePreviewVisible={setCandidatePreviewVisible}
              />
            ) }
          </>
        ) : (
          <SkeletonCard />
        )}

    </>
  );
};
export default JobDetails;
