/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-danger */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { PhoneFilled, RightOutlined, RiseOutlined } from '@ant-design/icons';
import { useLazyQuery } from '@apollo/client';
import {
  Button, Card, Col, Collapse, Divider, Dropdown, Form, Menu, Modal, Row, Space, Tag, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import ApiConstants from 'constants/api-constants';
import {
  eduMapToName, empType, gender, proficiencyToName,
} from 'constants/enum-constants';
import { AppConstants } from 'constants/index';
import { UserDetailsType } from 'lib/authenticationHOC';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import { findRecommendedCandidatesForEmployerCount } from 'screens/authenticated/ApplicationsTab/Desktop/recommendedApiQuery';
import {
  getJobSlotsData, IAssessmentData, stripHtmlTags,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import {
  assessmentInfo, getJobDetailsData, patchJobChanges, patchJobChangesData,
} from 'service/job-posting-service';
import { PricingStatsType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import {
  getOrganisationDetails, getPricingStats, OrgDetailsType,
} from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { getLoggedInUser } from 'service/accounts-settings-service';
import { upgradeJob } from 'service/job-service';
import { setUrlParams } from 'service/url-params-service';
import { getUserInfo } from 'service/userInfoService';
import { pushClevertapEvent } from 'utils/clevertap';
import { IJobPost } from 'common/jobpost.interface';
import CandidateRequirementsReviewModal from 'components/JobDetails/CandidateRequirementsReviewModal';
import { preapreSalaryPatchChanges, prepareCandidateRequirementPatchObj, preparePOCPatchChanges } from 'utils';
import SalaryReviewModal from 'components/JobDetails/SalaryReviewModal';
import moment from 'moment';
import POCReviewModal from 'components/JobDetails/PocReviewModal';
import { getPOCManagers } from 'service/organization-service';

require('screens/authenticated/JobDetails/Mobile/JobDetails.mobile.less');

const JobDetailsMobileBanners = dynamic(() => import('screens/authenticated/JobDetails/Mobile/banner'), { ssr: false });
const JobDetails = dynamic(() => import('screens/authenticated/JobDetails/Mobile/editJobDetails/jobDetails'), { ssr: false });
const InterviewSlots = dynamic(() => import('screens/authenticated/JobDetails/Mobile/interviewSlots'), { ssr: false });
const NcarSlots = dynamic(() => import('screens/authenticated/JobDetails/Mobile/interviewSlots/nCARSlots'), { ssr: false });
const ActiveBoost = dynamic(() => import('screens/authenticated/JobsTab/Mobile/Components/ActiveBoost'), { ssr: false });
const EditCallHR = dynamic(() => import('screens/authenticated/JobDetails/Mobile/editJobDetails/editCallHR'), { ssr: false });
const EditJobLocation = dynamic(() => import('screens/authenticated/JobDetails/Mobile/editJobDetails/editJobLocation'), { ssr: false });
const EditJobTitle = dynamic(() => import('screens/authenticated/JobDetails/Mobile/editJobDetails/editJobTitle'), { ssr: false });

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface JDMobileProps {
  id: string,
  onCancel: () => void,
  userDetails: UserDetailsType | null
}

interface IManagerList{
  managerId: string;
  name: string;
  mobile: string;
}

const JobDetailsMobile: React.FC<JDMobileProps> = (props: JDMobileProps) => {
  const { id, onCancel, userDetails } = props;
  const [form] = Form.useForm();
  // State Setting
  const [jobData, setJobData] = useState<IJobPost>() as any;
  const [refresh, setrefresh] = useState(false);
  const [jobTitle, setjobTitle] = useState(false);
  const [interviewSlots, setInterviewSlots] = useState() as Array<any>;
  const [POCModal, setPOCModal] = useState({
    visible: false,
  });
  const [loggedInManagerType, setLoggedInManagerType] = useState('');
  const [userId, setUserId] = useState(userDetails?.userId);

  const [managers, setManagers] = useState<Array<IManagerList>>([]);

  const [state, setState] = useState({
    showJobDetails: false,
    showJobLocation: false,
    showSalary: false,
    showWorkHours: false,
    showCandidateReq: false,
  });

  const [pricingStats, setPricingStats] = useState<PricingStatsType>();

  const [orgData, setOrgData] = useState<OrgDetailsType>({
    orgId: '',
    offices: [],
    managers: [],
    contactsUnlocksLeft: 0,
    type: '',
  });

  const [callHr, setCallHr] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const [editCandReq, setEditCandReq] = useState(false);
  const [editSalary, setEditSalary] = useState(false);
  const [editJobLocation, setEditJobLocation] = useState(false);
  const [currentPanel, setCurrentPanel] = useState('');
  const [verifyModal, setverifyModal] = useState(false);
  const [callHrLoading, setCallHrLoading] = useState(false);
  const linkName = readMore ? 'read less' : '...read more ';
  const [assessmentData, setAssessmentData] = useState<Array<IAssessmentData>>([]);

  const [fetchGraphqlData, {
    data,
  }] = useLazyQuery(findRecommendedCandidatesForEmployerCount, {
    fetchPolicy: 'network-only',
    // errorPolicy: 'ignore',
  });

  const isVerifyModal = async (res): Promise<void> => {
    if (res && res.pricingPlanType === 'FR') {
      const apiCallUser = await getLoggedInUser();
      const userDetailsData = await apiCallUser.data;

      const apiCall = await getUserInfo(userDetailsData.objects[0].id, true);
      if (apiCall) {
        const response = await apiCall.data;
        if (response && response?.email && (AppConstants.GENERIC_EMAIL_IDS.includes(response?.email?.split('@')[1]) && !response?.mobile_verified)) {
          setverifyModal(true);
        }
      }
    }
  };
  const setJobDetails = async (): Promise<void> => {
    const res = await getJobDetailsData(id);
    const futureslotId = id.split('/');
    const jobSlotsResponse = await getJobSlotsData(futureslotId[0]);

    setJobData(res);
    if (res.state === 'J_O' && res.stage === 'J_A') {
      fetchGraphqlData({
        variables: {
          job_id: id,
          first: 0,
          after: 0,
        },
      });
    }
    setInterviewSlots(jobSlotsResponse || []);
    isVerifyModal(res);
  };

  const getAssessmentInfo = async (faId, orgId, jobState): Promise<void> => {
    const apiRes = await assessmentInfo(faId, orgId);
    if ([200, 201, 202]?.includes(apiRes?.status)) {
      const flatData = apiRes?.data?.map((elem) => ({
        id: elem?.assessment_id,
        active: elem?.active,
        description: elem?.assessment_description,
        title: elem?.assessment_title,
        skills: elem?.skills,
      }));
      setAssessmentData(flatData);
    }
  };

  const getManagers = async (orgId: string) : Promise<void> => {
    if (orgId) {
      const response = await getPOCManagers(orgId);
      if ([200, 201, 202].includes(response.status)) {
        const managerList = response?.data?.map((manager) => {
          if (manager?.user_id === userId) {
            setLoggedInManagerType(manager?.type);
          }
          return {
            name: `${manager?.user?.first_name} ${manager?.user?.last_name}`,
            mobile: manager?.user?.mobile,
            managerId: manager?.id,
          };
        });
        setManagers(managerList);
        // if (managerList?.length > 1) {
        //   setState((prevState) => ({
        //     ...prevState,
        //     editButtonVisible: true,
        //   }));
        // }
      }
    }
  };

  const patchrequest = (msg): void => {
    if (msg === 'success') { setrefresh(!refresh); }
  };

  const closeModal = (): void => {
    onCancel();
  };

  const convertExperience = (): string => {
    const min = (jobData?.minExperience || 0) / 12;
    const max = (jobData?.maxExperience || 0) / 12;
    if (min === 0 && max === 0) {
      return 'Freshers are allowed';
    }
    return `${min}yrs to ${max}yrs`;
  };
  const shareItems = (
    <Menu>
      <Menu.Item key={Math.random()}>
        <a href={`${ApiConstants.FACEBOOK_SHARE_LINK}job/${jobData?.jobslug}/${jobData?.id}`}>facebook</a>
      </Menu.Item>
      <Menu.Item key={Math.random()}>
        <a href={`${ApiConstants.LINKEDIN_SHARE_LINK}job/${jobData?.jobslug}/${jobData?.id}`}>Linkedin</a>
      </Menu.Item>
      <Menu.Item key={Math.random()}>
        <a href={`${ApiConstants.TWITTER_SHARE_LINK}job/${jobData?.jobslug}/${jobData?.id}`}>Twitter</a>
      </Menu.Item>
      <Menu.Item key={Math.random()}>
        <a href={`${ApiConstants.EMAIL_SHARE_LINK}job/${jobData?.jobslug}/${jobData?.id}`}>Email JD</a>
      </Menu.Item>
    </Menu>
  );

  // eslint-disable-next-line consistent-return
  const initPricingAndUnlockInfo = async (): Promise<void|null> => {
    const odata = await getOrganisationDetails();
    let pricingData;
    if (odata && odata.orgId) {
      setOrgData(odata);
      pricingData = await getPricingStats(odata.orgId);
    } else { return null; }

    if (pricingData) {
      if (odata) {
        setPricingStats(pricingData);
      }
    }
    // used promise chain, so that it doesn't block jobs data
  };

  const updateCallHRHandler = async (value): Promise<void> => {
    setCallHrLoading(true);
    const patchObj = {
      share_contact_to_public: value,
    };
    const apiCall = await patchJobChanges(id, patchObj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      patchrequest('success');
    }
    setCallHrLoading(false);
  };

  const featureJobHandler = async (): Promise<void> => {
    pushClevertapEvent('Special Click',
      { Type: 'Feature Job', JobId: `${jobData.id}` });

    if (jobData?.pricingPlanType === 'FR'
    && pricingStats?.pricing_stats?.total_pricing_stats?.FJ?.remaining
    ) {
      const featureApiCall = await upgradeJob({
        job_ids: [jobData?.id],
        plan_id: pricingStats?.pricing_stats?.plan_wise_pricing_stats?.[0]?.id,
      });
      if ([200, 201, 202].includes(featureApiCall.status)) {
        patchrequest('success');
      }
    } else {
      router.Router.pushRoute('PricingPlans');
    }
  };

  const submitCandidateReqHandler = async (candidateInfo): Promise<void> => {
    const experience = candidateInfo.experienceRange ? candidateInfo.experienceRange.split('-') : [0, 0];
    const formObj = {
      ...candidateInfo,
      minimumExperience: parseInt(experience[0], 10) * 12,
      maximumExperience: parseInt(experience[1], 10) * 12,
    };
    const patchObj = prepareCandidateRequirementPatchObj(formObj);
    const response = await patchJobChangesData(jobData?.id, patchObj);
    setJobData(response);
    setEditCandReq(false);
  };

  const submitSalaryHandler = async (salaryInfo): Promise<void> => {
    const formData = { ...salaryInfo };

    formData.shiftStartTime = moment(formData.shiftStartTime, 'HH:mm:ss').format('HH:mm').toString();
    formData.shiftEndTime = moment(formData.shiftEndTime, 'HH:mm:ss').format('HH:mm').toString();
    formData.workDays = formData.workDays || 5;
    const patchObj = preapreSalaryPatchChanges(formData);
    const response = await patchJobChangesData(jobData.id, patchObj);
    setJobData(response);
    setEditSalary(false);
  };

  const updateVisbleHandler = (): void => {
    setPOCModal((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const pocSubmitHandler = async (formData): Promise<void> => {
    const patchObj = preparePOCPatchChanges(formData.POCDetails);
    const response = await patchJobChangesData(jobData.id, patchObj);
    setJobData(response);
    // updatePOCHandler(formData);
    updateVisbleHandler();
  };

  const setUpCallHRDetails = async ():Promise<void> => {
    if (!userId) {
      const userResponse = await getLoggedInUser();
      setUserId(userResponse?.data?.objects?.[0].id);
    }
    if (jobData) {
      await getManagers(jobData?.orgId);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setJobDetails();
    }, 1000);
    initPricingAndUnlockInfo();
  }, [refresh]);

  useEffect(() => {
    setUpCallHRDetails();
  }, [jobData, userId]);

  useEffect(() => {
    if (jobData && Object?.keys(jobData)?.length > 0) {
      getAssessmentInfo(jobData?.functionalArea?.id, jobData?.orgId, jobData?.state);
    }
  }, [jobData]);

  return (
    <div className="m-jd">
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`${jobData?.title} | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`${jobData?.title} | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      {/* Maps Start */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${config.MAPS_API_KEY_FRONTEND}&libraries=places`}
      />
      {/* Maps End */}

      <Modal
        visible
        className="full-screen-modal m-jd-container"
        closable={false}
        footer={null}
        title={[
          <Row key={Math.random()}>
            <Col span={24} onClick={closeModal}><CustomImage src="/svgs/m-back.svg" width={24} height={24} alt="Close" /></Col>
            <Col span={24} className="m-top-24">
              {
                (jobData && jobData.pricingPlanType === 'FR'
                && jobData.activeTag && jobData.jobState === 'J_O') && (
                  <Text className="jd-active-banner">
                    ACTIVE
                    {' '}
                    <CustomImage
                      src="/svgs/icon-active.svg"
                      width={72}
                      height={20}
                      alt="active-tag"
                    />
                  </Text>
                )
              }
              {
                (jobData && jobData.pricingPlanType === 'JP') && (
                  <Text className="jd-premium-banner">
                    <CustomImage
                      src="/svgs/m-premium.svg"
                      height={16}
                      width={16}
                      alt="Premium"
                    />
                    FEATURED
                    {' '}
                  </Text>
                )
              }
            </Col>
            <Col span={24}>
              <Text className="m-jd-title">{jobData?.title}</Text>
              {
                (jobData && jobData.jobState !== 'J_C') && (
                  <Button
                    type="link"
                    className="p-all-0"
                    icon={(
                      <CustomImage
                        src="/images/job-details/jd-edit.svg"
                        width={18}
                        height={18}
                        alt="edit"
                      />
                    )}
                    onClick={(): void => { setjobTitle(true); }}
                  />
                )
              }
            </Col>
            <Col span={24}>
              <Text className="m-jd-subtitle">
                <Link href="/"><a>{jobData?.hiringOrgName || jobData?.organizationPopularName}</a></Link>
              </Text>
            </Col>
            <Col span={24} className="p-top-8">
              <Space>
                {jobData?.id
                  ? (
                    <Button
                      type="primary"
                      target="_blank"
                      href={`${config.AJ_URL}job/${jobData?.jobslug}/${jobData?.id}`}
                      className="text-white text-semibold b-radius-4"
                      size="middle"
                      style={{
                        height: 36, lineHeight: '36px',
                      }}
                      onClick={():void => {
                        pushClevertapEvent('Special Click', { Type: 'Candidate Preview' });
                      }}
                    >
                      Candidate Preview
                    </Button>
                  ) : null}
                <Dropdown overlay={shareItems} trigger={['click']}>
                  <Button className="m-jd-share" key="share" type="default">
                    <span>Share</span>
                    <CustomImage
                      src="/svgs/m-whatsapp.svg"
                      width={24}
                      height={24}
                      alt="share"
                    />
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>,
        ]}
      >
        {
          jobData
            ? (
              <Container>
                <UnverifiedEmailNotification />
                {/* Call HR Section */}
                <Row>
                  <Col span={24} className="m-top-8">
                    {
                      !jobData?.clientApprovalRequired ? (
                        <Card
                          key="car-job"
                          className="m-jd-card no-body"
                          title={[
                            <Row key="m-call-hr" gutter={[8, 16]}>
                              <Col>
                                <CustomImage
                                  src="/images/job-details/car-job.png"
                                  width={40}
                                  height={40}
                                  alt="car-job"
                                />
                              </Col>
                              <Col style={{ display: 'flex', alignItems: 'center' }}>
                                <Paragraph key="hr-enabled" className="text-medium font-bold">
                                  Candidate shortlisting mandatory
                                </Paragraph>
                              </Col>
                            </Row>,
                          ]}
                        />
                      )
                        : (
                          <Card
                            key="walk-in-job"
                            className="m-jd-card no-body"
                            title={[
                              <Row key="m-call-hr" gutter={[8, 16]}>
                                <Col>
                                  <CustomImage
                                    src="/images/job-details/walk-in-job.svg"
                                    width={48}
                                    height={48}
                                    alt="walk-in-job"
                                  />
                                </Col>
                                <Col style={{ display: 'flex', alignItems: 'center' }}>
                                  <Paragraph key="hr-enabled" className="text-medium font-bold">
                                    Direct Interviews Allowed
                                  </Paragraph>
                                </Col>
                              </Row>,
                            ]}
                          />
                        )
                    }
                    {
                      jobData.shareContact ? (
                        <Card
                          key="call-hr"
                          className="m-jd-card no-body"
                          title={[
                            <Row key="m-call-hr" justify="center" gutter={[0, 16]}>
                              <Col span={24}>
                                <Row>
                                  <Col span={22}>
                                    <Row>
                                      <Col>
                                        <CustomImage
                                          src="/images/job-details/jd-call-hr.svg"
                                          width={48}
                                          height={48}
                                          alt="Call HR"
                                        />
                                      </Col>
                                      <Col>
                                        <Paragraph key="hr-enabled" className="text-medium font-bold">
                                          Call HR Enabled
                                          <CustomImage
                                            src="/images/job-details/jd-callhr-tick.svg"
                                            width={24}
                                            height={24}
                                            alt="call-hr"
                                          />
                                        </Paragraph>
                                        <Paragraph className="jd-description">{`${jobData?.pointOfContacts?.name} (${jobData?.pointOfContacts?.mobile})`}</Paragraph>
                                        <Paragraph key="hr-description" className="jd-description">Jobseekers can call you directly</Paragraph>
                                      </Col>
                                    </Row>
                                  </Col>
                                  <Col span={2}>
                                    <Button
                                      type="link"
                                      icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="edit" />}
                                      onClick={
                                        ():void => setPOCModal((prevState) => ({ ...prevState, visible: true }))
                                      }
                                      className="ct-edit-btn"
                                    />
                                  </Col>

                                </Row>
                              </Col>
                              <Col span={22}>
                                <Button
                                  type="primary"
                                  className="br-4"
                                  style={{ width: '100%' }}
                                  loading={callHrLoading}
                                  onClick={async (): Promise<void> => {
                                    await updateCallHRHandler(false);
                                  }}
                                >
                                  <Text style={{ color: 'white' }}>
                                    <PhoneFilled rotate={90} />
                                    &nbsp;
                                    Turn off Call HR on this job
                                  </Text>
                                </Button>
                              </Col>
                            </Row>,
                          ]}

                        />
                      ) : (
                        <Card
                          key="call-hr"
                          className="m-jd-card no-body"
                          title={[
                            <Row justify="center">
                              <Col span={24}>
                                <Row>
                                  <Col span={4}>
                                    <CustomImage
                                      src="/images/job-details/jd-call-hr.svg"
                                      width={48}
                                      height={48}
                                      alt="call-hr"
                                    />
                                  </Col>
                                  <Col span={20}>
                                    <Row>
                                      <Col span={24}>
                                        <Text strong className="text-medium">Enable Call HR</Text>
                                      </Col>
                                      <Col span={24}>
                                        <Text type="secondary">
                                          Get direct calls from jobseekers
                                        </Text>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>
                              <Col span={22}>
                                <Button
                                  type="primary"
                                  className="br-4"
                                  style={{ width: '100%' }}
                                  loading={callHrLoading}
                                  onClick={async (): Promise<void> => {
                                    await updateCallHRHandler(true);
                                  }}
                                >
                                  <Text style={{ color: 'white' }}>
                                    <PhoneFilled rotate={90} />
                                    &nbsp;
                                    Enable Call HR on this job
                                  </Text>
                                </Button>
                              </Col>
                            </Row>,
                          ]}
                        />
                      )
                    }
                  </Col>

                  {/* Applications Section */}
                  <Col span={24} className="m-top-8">
                    <Card
                      key="applications"
                      className="m-jd-app-card"
                      title={[
                        <Row key={Math.random()} align="middle">
                          <Col><CustomImage src="/svgs/application.svg" width={48} height={48} alt="Applications" /></Col>
                          <Col>
                            <Text className="text-medium font-bold ">
                              View Applications
                            </Text>
                          </Col>
                          <Col className="p-left-8">
                            <Text className="total-count">
                              {jobData.totalApplications}
                            </Text>
                          </Col>
                        </Row>,
                      ]}
                      extra={(
                        <Button
                          type="link"
                          className="p-all-0"
                          disabled={jobData?.totalApplications === 0}
                          icon={<RightOutlined className="right-arrow" />}
                          href={`${ApiConstants.APPLICATIONS_TAB}`}
                          onClick={():void => {
                            pushClevertapEvent('Special Click', { Type: 'View Applications' });
                          }}
                        />
                      )}
                    />
                    {
                      jobData.banner === 'premiumPromotion' && (
                        <>
                          <Row className="m-jd-upgrade-banner">
                            <Col span={16}>
                              <Row>
                                <Col span={24} className="m-b-8">
                                  <Text className="banner-label">Get 3x applications</Text>
                                </Col>

                              </Row>
                            </Col>
                            <Col span={8}>
                              <Row>
                                <Col span={14} className="text-right">
                                  <CustomImage src="/images/job-details/jd-upgrade.svg" width={64} height={40} alt="Upgrade" />
                                </Col>

                              </Row>
                            </Col>
                          </Row>
                          <Row
                            className="m-jd-upgrade-banner"
                            justify="center"
                          >

                            <Col span={24}>
                              <Button
                                type="default"
                                size="small"
                                className="banner-button"
                                onClick={featureJobHandler}
                              >
                                <RiseOutlined />
                                Promote this job
                              </Button>
                            </Col>
                          </Row>

                        </>
                      )
                    }
                    {
                      jobData.banner === 'activeTip' && (
                        <ActiveBoost />
                      )
                    }
                  </Col>
                  {/* Database Section */}
                  {(jobData?.id && jobData?.state === 'J_O' && jobData?.stage === 'J_A') ? (
                    <Col span={24} className="m-top-8">
                      <Card
                        key="database"
                        className="m-jd-app-card"
                        title={[
                          <Row key={Math.random()} align="middle">
                            <Col><CustomImage src="/svgs/application.svg" width={48} height={48} alt="Database" /></Col>
                            <Col>
                              <Text className="text-medium font-bold ">
                                View Database
                              </Text>
                            </Col>
                            <Col className="p-left-8">
                              <Text className="total-count">
                                {(data?.findRecommendedCandidatesForEmployer?.totalCount) || 0}
                              </Text>
                            </Col>
                          </Row>,
                        ]}
                        extra={(
                          <Button
                            type="link"
                            className="p-all-0"
                            icon={<RightOutlined className="right-arrow" />}
                            disabled={data?.findRecommendedCandidatesForEmployer?.totalCount === 0}
                            onClick={():void => {
                              setUrlParams([{ job: id, tab: 'database' }]);
                              pushClevertapEvent('Special Click', { Type: 'View Database' });
                            }}
                          />
                        )}
                      />
                    </Col>
                  ) : null}
                  <Col span={24} className="m-top-8">
                    {
                      (jobData?.clientApprovalRequired)
                        ? (
                          <InterviewSlots
                            interviewSlots={interviewSlots}
                            orgData={orgData}
                            jobData={jobData}
                            patchrequest={patchrequest}
                          />
                        )
                        : jobData?.appliedJobType === 'NCAR'
                          ? (
                            <NcarSlots
                              orgData={orgData}
                              jobData={jobData}
                              patchrequest={patchrequest}
                            />
                          )
                          : null
                    }
                  </Col>
                </Row>

                <Row className="m-jd-action m-top-8">
                  <Col span={24}>
                    <Collapse
                      className="m-jd-collapse"
                      accordion
                      onChange={(key): void => setCurrentPanel(Array.isArray(key) ? key[0] : key)}
                      expandIcon={({ isActive }): JSX.Element => (
                        <RightOutlined rotate={isActive ? -90 : 90} />)}
                    >
                      {/* Job Details */}
                      <Panel
                        header={<Text className="font-bold">Job Details</Text>}
                        key="jobDetails"
                        extra={(jobData.state !== 'J_C' && currentPanel === 'jobDetails') && (
                          <Button
                            onClick={(): void => {
                              setState((prevState) => ({
                                ...prevState,
                                showJobDetails: true,
                              }));

                              pushClevertapEvent('Special Click', { Type: 'Edit Job Details' });
                            }}
                            className="p-all-0 auto-size"
                            type="link"
                            icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="resume" />}
                          />
                        )}
                      >
                        <Row>
                          {/* Job Category */}
                          <Col span={24}>
                            <Row>
                              <Col span={24}>
                                <Text className="text-small text-disabled">Job Category</Text>
                              </Col>
                              <Col span={24}>
                                <Text>{jobData?.functionalArea?.name}</Text>
                              </Col>
                            </Row>
                          </Col>

                          {/* Employment Type */}
                          <Col span={24} className="m-top-16">
                            <Row>
                              <Col span={24}>
                                <Text className="text-small text-disabled">Employment Type</Text>
                              </Col>
                              <Col span={24}>
                                <Text>{empType(jobData?.employmentType)}</Text>
                              </Col>
                            </Row>
                          </Col>

                          {/* Job Description */}
                          <Col span={24} className="m-top-16">
                            <Row>
                              <Col span={24}>
                                <Text className="text-small text-disabled">Job Description</Text>
                              </Col>
                              <Col span={24}>
                                {
                                  jobData.description.length > 215 ? (
                                    !readMore ? (
                                      <>
                                        <Text>
                                          {stripHtmlTags(jobData?.description.substring(0, 215))}
                                        </Text>
                                        <Button type="link" className="m-read-btn" onClick={():void => { setReadMore(!readMore); }}>{linkName}</Button>
                                      </>
                                    ) : (
                                      <>
                                        <Text>
                                          {stripHtmlTags(
                                            jobData?.description
                                              .substring(0, jobData.description.length),
                                          )}
                                        </Text>
                                        <Button type="link" className="m-read-btn" onClick={():void => { setReadMore(!readMore); }}>{linkName}</Button>
                                      </>
                                    )
                                  ) : (
                                    <Text>
                                      {stripHtmlTags(jobData?.description)}
                                    </Text>
                                  )
                                }
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Panel>

                      {/* Job Location & Openings */}
                      <Panel
                        header={<Text className="font-bold">Job Location & Openings</Text>}
                        key="jobLocation"
                        extra={(jobData.state !== 'J_C' && currentPanel === 'jobLocation') && (
                          <Button
                            onClick={(): void => {
                              setEditJobLocation(true);
                              // router.Router.pushRoute(
                              //   'JobSpecs',
                              //   { id },
                              // );
                              pushClevertapEvent('Special Click', { Type: 'Edit Job Location' });
                            }}
                            type="link"
                            className="p-all-0 auto-size"
                            icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="resume" />}
                          />
                        )}
                      >
                        {/* Job Locations */}

                        <Row>

                          <Col span={24}>
                            <Row>
                              <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Job Location(s)</Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>
                                <Paragraph>{jobData?.cityName}</Paragraph>
                                <Paragraph key={jobData?.locality?.value}>{jobData?.locality?.label}</Paragraph>
                              </Col>
                            </Row>
                          </Col>
                          <Col span={24}>
                            <Row>
                              <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Total Openings</Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>{jobData?.vacancies}</Col>
                            </Row>
                          </Col>

                        </Row>

                      </Panel>

                      {/* Salary */}
                      <Panel
                        header={<Text className="font-bold">Salary</Text>}
                        key="salary"
                        extra={(jobData.state !== 'J_C' && currentPanel === 'salary') && (
                          <Button
                            onClick={(): void => {
                              setEditSalary(true);
                              pushClevertapEvent('Special Click', { Type: 'Edit Salary' });
                            }}
                            type="link"
                            className="p-all-0 auto-size"
                            icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="resume" />}
                          />
                        )}
                      >
                        <Row gutter={[0, 8]}>
                          <Col span={24}>
                            <Row>
                              <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>In hand Salary</Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>
                                <Paragraph>{`₹${jobData?.minOfferedSalary} To ₹${jobData?.maxOfferedSalary} per month`}</Paragraph>
                              </Col>
                            </Row>
                          </Col>
                          <Col span={24}>
                            <Row>
                              <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Working Days</Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>{`${jobData?.workDays?.length} per week`}</Col>
                            </Row>
                          </Col>
                          <Col span={24}>
                            <Row>
                              <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Shift Timings</Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>{jobData?.shiftStartTime ? `${jobData?.shiftStartTime} - ${jobData?.shiftEndTime}` : ''}</Col>
                            </Row>
                          </Col>
                        </Row>
                      </Panel>

                      {/* Candidate Requirement */}
                      <Panel
                        header={<Text className="font-bold">Candidate Requirement</Text>}
                        key="candidateRequirement"
                        extra={(jobData.state !== 'J_C' && currentPanel === 'candidateRequirement') && (
                          <Button
                            onClick={(): void => {
                              setEditCandReq(true);

                              pushClevertapEvent('Special Click', { Type: 'Edit Candidate Requirement' });
                            }}
                            type="link"
                            className="p-all-0 auto-size"
                            icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="CandidateRequirements" />}
                          />
                        )}
                      >
                        <Row gutter={[0, 10]}>
                          <Col span={24}>
                            <Row>
                              <Col xs={{ span: 10 }} lg={{ span: 6 }}>
                                <Space align="center">
                                  <CustomImage src="/images/job-details/jd-resume-ic.svg" width={24} height={24} alt="resume" />
                                  <Text className="feature-name">Resume</Text>
                                </Space>
                              </Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>{`Resume ${jobData?.isResumeSubscribed ? 'required' : 'not required'}`}</Col>
                            </Row>
                          </Col>
                          <Divider style={{ margin: '8px 0' }} />
                          <Col span={24}>
                            <Row>
                              <Col xs={{ span: 10 }} lg={{ span: 6 }}>
                                <Space>
                                  <CustomImage src="/images/job-details/jd-edu-ic.svg" width={24} height={24} alt="education" />
                                  <Text className="feature-name">Minimum Education</Text>
                                </Space>

                              </Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>
                                {`${eduMapToName(jobData?.proficiencyLevel)}`}
                                {jobData?.proficiencyLevel > 0 ? ' degree required' : ' education requirement'}
                              </Col>
                            </Row>
                          </Col>
                          <Divider style={{ margin: '8px 0' }} />
                          <Col span={24}>
                            <Row>
                              <Col xs={{ span: 10 }} lg={{ span: 6 }}>
                                <Space>
                                  <CustomImage src="/images/job-details/jd-exp-ic.svg" width={24} height={24} alt="resume" />
                                  <Text className="feature-name">Experience</Text>
                                </Space>
                              </Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>
                                {convertExperience()}
                              </Col>
                            </Row>
                          </Col>
                          <Divider style={{ margin: '8px 0' }} />
                          <Col span={24}>
                            <Row>
                              <Col xs={{ span: 10 }} lg={{ span: 6 }}>
                                <Space>
                                  <CustomImage src="/images/job-details/jd-dem-ic.svg" width={24} height={24} alt="resume" />
                                  <Text className="feature-name">Demography</Text>
                                </Space>
                              </Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>
                                <li className="list-style">{`Gender ${gender(jobData?.genderPreference)}`}</li>
                                <li className="list-style">{`Age ${jobData?.minPreferredAge}-${jobData?.maxPreferredAge} yrs`}</li>
                              </Col>
                            </Row>
                          </Col>
                          <Divider style={{ margin: '8px 0' }} />
                          <Col span={24}>
                            <Row>
                              <Col xs={{ span: 10 }} lg={{ span: 6 }}>
                                <Space>
                                  <CustomImage src="/images/job-details/jd-com-ic.svg" width={24} height={24} alt="resume" />
                                  <Text className="feature-name">English</Text>
                                </Space>
                              </Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }}>
                                {`${proficiencyToName(jobData?.englishProficiency)} English`}
                              </Col>
                            </Row>
                          </Col>
                          <Divider />
                          <Col span={24}>
                            <Row>
                              <Col xs={{ span: 10 }} lg={{ span: 6 }}>
                                <Space>
                                  <CustomImage src="/images/job-details/jd-doc-ic.svg" width={24} height={24} alt="resume" />
                                  <Text className="feature-name">Documents and Assets</Text>
                                </Space>
                              </Col>
                              <Col xs={{ span: 12 }} lg={{ span: 18 }} className="job-tags-container">
                                {
                                  jobData?.documents?.map((tag) => (
                                    <Tag
                                      key={tag.id}
                                      color="default"
                                    >
                                      {tag.name}
                                    </Tag>
                                  ))
                                }
                              </Col>
                            </Row>
                          </Col>
                          {assessmentData?.length > 0 && (
                            <>
                              <Divider style={{ margin: '8px 0' }} />
                              <Col span={24}>
                                <Row>
                                  <Col xs={{ span: 10 }} lg={{ span: 6 }}>
                                    <Space>
                                      <CustomImage src="/images/job-details/jd-skill-ic.svg" width={18} height={18} alt="resume" />
                                      <Text className="feature-name">Skill Assessment</Text>
                                    </Space>
                                  </Col>
                                  <Col xs={{ span: 12 }} lg={{ span: 18 }} className="job-tags-containerasdf">
                                    {jobData?.assessment?.length > 0 ? (
                                      <Space direction="vertical">
                                        <Text>{jobData?.assessment?.[0]?.title}</Text>
                                        <Text type="secondary">{jobData?.assessment?.[0]?.description}</Text>
                                      </Space>
                                    ) : (
                                      <Text>No Assessment selected</Text>
                                    )}
                                  </Col>
                                </Row>
                              </Col>
                            </>
                          )}
                        </Row>
                      </Panel>
                    </Collapse>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <JobDetailsMobileBanners
                      status={jobData.jobStatus}
                      expiryDate={jobData.expiryDate}
                      patchrequest={patchrequest}
                      id={jobData.id}
                      job={jobData}
                      userDetails={userDetails}
                      remainingFreeCredits={
                        pricingStats?.pricing_stats?.total_pricing_stats?.JP?.remaining || 0
                      }
                      remainingJPCredits={
                        pricingStats?.pricing_stats?.total_pricing_stats?.FJ?.remaining || 0
                      }
                      orgId={orgData.orgId}
                    />
                  </Col>
                </Row>
                {
                  state.showJobDetails && (
                    <JobDetails
                      functionalArea={jobData.functionalAreaId}
                      employmentType={jobData.employmentType}
                      id={jobData.id}
                      title={jobData.title}
                      description={jobData.description}
                      patchrequest={patchrequest}
                      onCancel={(): void => setState((prevState) => ({
                        ...prevState,
                        showJobDetails: false,
                      }))}
                      jobData={jobData}
                    />
                  )
                }
                {
                  jobTitle && (
                    <EditJobTitle
                      onCancel={(): void => setjobTitle(false)}
                      jobData={jobData}
                      form={form}
                      orgType={orgData.type || ''}
                      patchrequest={patchrequest}
                    />
                  )
                }
                {
                  editSalary && (
                    <SalaryReviewModal
                      visible={editSalary}
                      job={jobData}
                      form={form}
                      onClose={(): void => setEditSalary(false)}
                      onSubmit={submitSalaryHandler}
                      isNewUser={false}
                    />
                  )
                }

                {
                  editJobLocation && (
                    <EditJobLocation
                      jobData={jobData}
                      patchrequest={patchrequest}
                      form={form}
                      onCancel={(): void => setEditJobLocation(false)}
                    />
                  )
                }
                {
                  editCandReq && (
                    <CandidateRequirementsReviewModal
                      visible={editCandReq}
                      form={form}
                      job={jobData}
                      onClose={(): void => setEditCandReq(false)}
                      onSubmit={submitCandidateReqHandler}
                      isNewUser={false}
                      assessmentData={assessmentData}
                      setAssessmentData={setAssessmentData}
                    />
                  )
                }
                {
                  callHr && (
                    <EditCallHR
                      jobData={jobData}
                      onCancel={(): void => setCallHr(false)}
                      patchrequest={patchrequest}
                      userDetails={userDetails}
                    />
                  )
                }
              </Container>
            ) : null
        }
      </Modal>
      {
        POCModal.visible && (
          <POCReviewModal
            isPrimaryManager={loggedInManagerType === 'P'}
            visible={POCModal.visible}
            form={form}
            job={jobData}
            onClose={updateVisbleHandler}
            onSubmitForm={pocSubmitHandler}
            managersList={managers}
          />
        )
      }
    </div>
  );
};

export default JobDetailsMobile;
