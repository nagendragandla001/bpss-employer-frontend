/* eslint-disable no-useless-return */
/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
import {
  ArrowLeftOutlined, LoadingOutlined,
} from '@ant-design/icons';
import {
  Button, Col, Form, PageHeader, Row, Space, Spin, Steps, Typography,
} from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import { IJobPost } from 'common/jobpost.interface';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';
import { ADD, notificationContext } from 'contexts/notificationContext';
import { observer } from 'mobx-react';
import Link from 'next/link';
import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import router from 'routes';
import { patchJobOpen } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import FeatureJobSuccessMessage from 'screens/authenticated/JobPostingForm/CandidateRequiremntsForm/FeatureJobSuccessMessage';
import { PricingStatsType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import { getLoggedInUser } from 'service/accounts-settings-service';
import { fetchAllJobs, getJobDetailsData, getOpenJobs } from 'service/job-posting-service';
import { renewJob, upgradeJob } from 'service/job-service';
import { getOrgJobsStats } from 'service/jobs-tab-service';
import { getUserInfo } from 'service/login-service';
import { getOrgPricingStats, getUnifiedOrgDetails } from 'service/organization-service';
import { UserDetailsStoreModel } from 'stores';
import setupOrganizationStore from 'stores/setupOrganizationStore';
import setupUserStore from 'stores/setupUserStore';
import { logEvent, logGtagEvent } from 'utils/analytics';
import { pushClevertapEvent } from 'utils/clevertap';
import { getFlatJobData } from 'utils/job-posting-utils';
import { mLog } from 'utils/logger';

// import UnverifiedModal from 'components/UnverifiedEmailNotification/UnverifiedModal';

require('lib/jobPostingHOC.less');

const { Text, Paragraph } = Typography;

// Store Initialization
let { orgData: organizationStore } = setupOrganizationStore();
// let { jobPost: jobStore } = setupJobPostStore();
let { userData: userDetailsStore } = setupUserStore();

const navigationSteps = [
  {
    title: 'Job Details',
    value: 1,
    id: 'job-details',
    page: 'JobSpecs',
  },
  {
    title: 'Candidate Requirements',
    value: 2,
    id: 'candidate-requirements',
    page: 'CandidateSpecs',
  },
  {
    title: 'Review Job',
    value: 3,
    id: 'review-job',
    page: 'CandidateSpecs',
  },
];
const stepTitle = ['Job Details', 'Candidate Requirements', 'Review Job'];
const previousPages = [
  ['', 'JobSpecs'],
  ['JobSpecs', 'CandidateSpecs'],
  ['CandidateSpecs', 'GetDirectCalls'],
];

const { Step } = Steps;

interface ComponentInfo {
  step: number
}
interface IDuplicateLocation {
  description:string | undefined;
  place_id:string | undefined;
  vacancies:number;
}

interface IPricingState {
  type: string;
  featuredCredits: number;
  JPCredits: number;
  planId: number | undefined | null;
  upgraded: boolean;
}

const WithJobPostingHOC = (WrappedComponent, componentInfo: ComponentInfo): any => {
  const JobPostingHOC = (props:{id:string, duplicateId:string}): JSX.Element => {
    const { id, duplicateId } = props;
    // States
    const [form] = Form.useForm();
    // const [enableMobileGuidelines, setEnableMobileGuidelines] = useState(false);
    const [pricingState, setPricingState] = useState<IPricingState>({} as IPricingState);
    const [jobData, setJobData] = useState<IJobPost>({} as IJobPost);
    const [jobAsFeatured, setJobAsFeatured] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [abTestFlow, setABTestFlow] = useState('');
    const { dispatchNotification } = useContext(notificationContext);

    const [state, setState] = useState({
      OrgStoreFetching: false,
      userDetailsFetching: false,
      userDetails: {} as UserDetailsStoreModel,
    });

    const initOrgStore = async (): Promise<void> => {
      setState((prevState) => ({
        ...prevState,
        OrgStoreFetching: true,
      }));
      // const orgResponse = await getOrgDetails();
      const orgResponse = await getUnifiedOrgDetails();

      if ([200, 201, 202].includes(orgResponse?.status)) {
        const { orgData } = setupOrganizationStore(orgResponse.data);
        organizationStore = orgData;
        setState((prevState) => ({
          ...prevState,
          OrgStoreFetching: false,
        }));
        const allOpenJobs = await getOpenJobs(orgResponse?.data?.objects?.[0]?._id);
        if (allOpenJobs === 0) {
          setIsNewUser(true);
        }
        mLog('Organization Store Initialized');
      } else if (orgResponse?.response?.status === 404) {
        setState((prevState) => ({
          ...prevState,
          OrgStoreFetching: false,
        }));
        setIsNewUser(true);
      } else {
        router.Router.pushRoute('logout');
      }
    };

    const initUserDetails = async (): Promise<void> => {
      setState((prevState) => ({
        ...prevState,
        userDetailsFetching: true,
      }));
      const userResponse = await getUserInfo(true);
      if ([200, 201, 202].includes(userResponse?.status)) {
        if (userResponse?.data?.objects && Array.isArray(userResponse?.data?.objects)) {
          const { userData } = setupUserStore(userResponse?.data?.objects[0]);
          userDetailsStore = userData;
          setState((prevState) => ({
            ...prevState,
            userDetailsFetching: false,
            userDetails: userData,
          }));
        }
        mLog('User Details Store Initialized');
      } else {
        router.Router.pushRoute('logout');
      }
    };

    const getPricingStats = async (jobId: any): Promise<PricingStatsType | null> => {
      const apiCall = await getOrgPricingStats(jobId);
      const response = await apiCall.data;
      return response;
    };

    const initNewJobData = async (): Promise<void> => {
      const jobApiCall = await getJobDetailsData(id);
      setJobData(jobApiCall);
    };

    const initPricingStat = useCallback(async (): Promise<void> => {
      const pricingApiCall = getPricingStats(organizationStore.id);
      const jobApiCall = getJobDetailsData(id);

      const pricingResponse = await pricingApiCall;
      const jobResponse = await jobApiCall;

      if (jobResponse) {
        setJobData(jobResponse);
      }

      setPricingState((prev) => ({
        ...prev,
        planId: pricingResponse?.pricing_stats?.plan_wise_pricing_stats[0]?.id,
      }));

      if (pricingResponse?.pricing_stats?.total_pricing_stats) {
        const ref = pricingResponse.pricing_stats.total_pricing_stats;
        setPricingState((prev) => ({
          ...prev,
          featuredCredits: ref?.FJ?.remaining || 0,
          JPCredits: ref?.JP?.remaining || 0,
        }));

        if (componentInfo.step === 3) {
          if (ref.JP && ref.JP.remaining > 0) {
            if (ref.FJ) {
              if (ref.FJ.remaining > 0) {
                if (jobResponse?.pricingPlanType === 'JP') {
                  if (jobResponse?.state === 'J_P') {
                    setPricingState((prev) => ({
                      ...prev,
                      type: 'RENEW_AS_FJ',
                    }));
                  } else {
                    setPricingState((prev) => ({
                      ...prev,
                      type: 'CONTINUE_FJ',
                    }));
                  }
                } else if (jobResponse?.state === 'J_O' && jobResponse?.stage === 'J_A') {
                  setPricingState((prev) => ({
                    ...prev,
                    type: 'CONTINUE_AS_FR',
                  }));
                } else if (jobResponse?.state === 'J_P') {
                  setPricingState((prev) => ({
                    ...prev,
                    type: 'RENEW_AS_FR',
                  }));
                } else {
                  setPricingState((prev) => ({
                    ...prev,
                    type: 'POST_AS_FJ',
                  }));
                }
              } else {
                setPricingState((prev) => ({
                  ...prev,
                  type: 'FJ_EXAUSTED',
                }));
              }
            } else {
              setPricingState((prev) => ({
                ...prev,
                type: 'BUY_FJ',
              }));
            }
          } else {
            setPricingState((prev) => ({
              ...prev,
              type: 'JP_EXAUSTED',
            }));
          }
        }
      }
    }, []);

    /**
     * Function to renew a job
     * @param {string} renewType - Featured or normal renew 'FEATURED'||'REGULAR
     * @returns void
     */
    const renewJobHandler = async (renewType) : Promise<void> => {
      if (renewType === 'FEATURED' && jobData?.pricingPlanType === 'FR') {
        const featureApiCall = await upgradeJob(
          { job_ids: [jobData?.id], plan_id: pricingState?.planId as (number | undefined) },
        );
        if (![200, 201, 202].includes(featureApiCall.status)) {
          return;
        }
      }
      const patchObject = {
        modified_by_id: state?.userDetails?.id,
        id: jobData?.id,
      };
      const apiCall = await renewJob(jobData?.id, patchObject);
      if (apiCall && apiCall.status
          && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        router.Router.pushRoute('MyJobs');
      }
    };

    const handlePreviousClick = (): void => {
      router.Router.pushRoute(navigationSteps[componentInfo.step - 2].page,
        { id });
    };

    const handleNextClick = (): void => {
      form.submit();
    };

    const getNavStepIcon = (step, index): JSX.Element => {
      const prefix = (index === componentInfo.step - 1) ? 'active' : 'inactive';
      return (
        <CustomImage
          height={prefix === 'active' ? 25 : 15}
          width={prefix === 'active' ? 25 : 16}
          src={`/images/job-posting/${prefix}-${step.id}.svg`}
          alt={step.title}
        />
      );
    };

    const trackPricingInfo = async (): Promise<void> => {
      initNewJobData();
      const jobs = await fetchAllJobs();
      if (jobs?.data?.objects?.length === 1) {
        setPricingState((prev) => ({
          ...prev,
          type: 'NEW_USER',
        }));
      }
      initPricingStat();
    };

    const logPricingSubmitEvent = (): void => {
      const trackObj = {
        category: 'job_post',
        action: 'pricing_plan_submit',
        label: 'pricing_plan',
        nonInteraction: false,
      };
      logEvent(trackObj);
      logGtagEvent('application_process_success');
    };

    const checkUnverifiedEmail = async (): Promise<boolean> => {
      const apiCall = await getLoggedInUser();
      const userData = await apiCall.data;
      if (userData && userData.objects && userData.objects.length
        && userData.objects[0].email_verified) {
        return true;
      }
      return false;
    };

    const orgDetailsCompleteCheck = (orgData): boolean => orgData && orgData.name
    && orgData.type && !!orgData.industry && Object.keys(orgData.industry).length > 0;

    /**
     * Function calls API to make job live
     */
    const openJobHandler = async (): Promise<void> => {
      if (jobData?.state === 'J_D' || pricingState?.type === 'NEW_USER') {
        const patchResponse = await patchJobOpen(jobData?.id);
        if ([200, 201, 202].includes(patchResponse?.status)) {
          if (isNewUser) {
            pushClevertapEvent('First Job Post', {
              Type: 'First Job Post Submit',
              JobId: jobData?.id,
            });
          } else {
            pushClevertapEvent('New Job Post', {
              Type: 'New Job Post Submit',
              JobId: jobData?.id,
            });
          }
          logGtagEvent('job_post_open');
          const updatedJobData = getFlatJobData(patchResponse?.data);
          setJobData(updatedJobData);
        } else {
          dispatchNotification({
            type: ADD,
            payload: {
              title: 'Job Posting Form - Candidate Requirements',
              description: 'Still job is in draft state. please try again later to move it to open state',
              iconName: '',
              notificationType: 'error',
              placement: 'topRight',
              duration: 4,
            },
          });
        }
      }
    };

    const postAsFeatureJobHandler = async (): Promise<void> => {
      openJobHandler();
      logPricingSubmitEvent();
      pushClevertapEvent('Job pricing plan chosen', { Type: 'PREMIUM' });

      if (pricingState.planId) {
        const apiCall = await upgradeJob({ job_ids: [id], plan_id: pricingState.planId });
        if ([200, 201, 202].includes(apiCall?.status)) {
          setJobAsFeatured(true);
        }
      }
    };

    const postAsRegularJobHandler = async (): Promise<void> => {
      openJobHandler();
      logPricingSubmitEvent();
      pushClevertapEvent('Job pricing plan chosen', { Type: 'REGULAR' });
      if (orgDetailsCompleteCheck(organizationStore) || await checkUnverifiedEmail()) {
        router.Router.pushRoute('MyJobs');
      } else {
        router.Router.pushRoute('CompanyProfile');
      }
    };

    const saveAndCloseHandler = (): void => {
      logPricingSubmitEvent();
      router.Router.pushRoute('MyJobs');
    };
    // function setupCallback(script: any, callback: () => void) {
    //   if (script.readyState) {
    //     script.onreadystatechange = function () {
    //       if (script.readyState === 'loaded' || script.readyState === 'complete') {
    //         script.onreadystatechange = null;
    //         callback();
    //       }
    //     };
    //   } else {
    //     script.onload = () => {
    //       callback();
    //     };
    //   }
    // }
    // const loadScript = (url: string, callback:any, id1:string) => {
    //   console.log('scriipt', document.getElementById(id1));
    //   let script: any;
    //   if (document.getElementById(id1)) {
    //     // If the script already exists then add the new callback to the existing one
    //     script = document.getElementById(id1);
    //     const oldFunc = script.onload;
    //     setupCallback(script, () => {
    //       oldFunc && oldFunc();
    //       callback();
    //     });
    //   } else {
    //     // If the script doesn't exists then create it
    //     script = document.createElement('script');
    //     script.type = 'text/javascript';
    //     script.src = url;
    //     // script.setAttribute('id', id);
    //     setupCallback(script, callback);
    //     document.getElementsByTagName('head')[0].appendChild(script);
    //   }
    // };
    // const callbackFunc = () => {};
    useEffect(() => {
      if (userDetailsStore.id === '') {
        initUserDetails();
      }
      // if (!organizationStore.id) {
      initOrgStore();
      // }
      if (props.duplicateId) {
        // initJobPostStore(props.duplicateId);
      }
      setABTestFlow(window.localStorage.getItem('GOVariant') as string);
      // loadScript(
      //   `https://maps.googleapis.com/maps/api/js?key=${config.MAPS_API_KEY_FRONTEND}&libraries=places`,
      //   callbackFunc,
      //   '__googleMapsScriptId',
      // );
      window.scrollTo(0, 0);
    }, []);
    useEffect(() => {
      if (organizationStore.id) {
        trackPricingInfo();
      }
    }, [initPricingStat, organizationStore]);

    useEffect(() => {
      if (componentInfo?.step === 1 && isNewUser) {
        pushClevertapEvent('First Job Post', {
          Type: 'First Job Post Land',
        });
      }
    }, [isNewUser, componentInfo]);

    const PricingCTAMobileInfo = ():JSX.Element => (
      <>
        {
          pricingState.type === 'RENEW_AS_FR' ? (
            <Space>
              <Button
                size="middle"
                type="default"
                style={{ background: '#FFCE32' }}
                className="br-4"
                onClick={async ():Promise<void> => renewJobHandler('FEATURED')}
              >
                <Text
                  className="text-base text-semibold"
                >
                  Renew as Featured Job
                </Text>
              </Button>
              <Button
                size="middle"
                type="default"
                ghost
                className="br-4"
                onClick={async (): Promise<void> => renewJobHandler('REGULAR')}
              >
                <Text
                  className="text-base text-white text-semibol"
                >
                  Renew as Regular Job
                </Text>
              </Button>
            </Space>
          ) : null
        }
        {
          pricingState.type === 'RENEW_AS_FJ' ? (
            <Space>
              <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                <Button
                  size="middle"
                  type="default"
                  style={{ background: '#FFCE32' }}
                  className="br-4"
                >
                  <Text
                    className="text-base text-semibold"
                  >
                    Renew as Featured Job
                  </Text>
                </Button>
              </Link>
            </Space>
          ) : null
        }
        {
          pricingState.type === 'NEW_USER' ? (
            <Row className="m-jp-footer" justify="start">
              <Col span={13}>
                <Text className="display-flex text-small text-white">
                  You have unlocked 2 regular job credits.
                </Text>
              </Col>
              <Col span={10}>
                <Button
                  size="small"
                  type="default"
                  style={{ background: '#FFCE32' }}
                  className="br-4 explore-mobile-btn"
                  onClick={postAsRegularJobHandler}
                >
                  <Text
                    className="text-small text-semibold"
                  >
                    Post as Regular Job
                  </Text>
                </Button>
              </Col>
            </Row>
          ) : null
        }

        {
          pricingState.type === 'BUY_FJ' ? (
            (
              <>
                <Row className="m-jp-footer">

                  <Text className="display-flex text-small text-white">
                    Buy featured credits and get 3x applications on your job.
                  </Text>
                </Row>
                <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                  <Button
                    size="small"
                    type="default"
                    style={{ background: '#FFCE32' }}
                    className="br-4"
                    onClick={postAsFeatureJobHandler}
                  >
                    <Text
                      className="text-small text-semibold"
                    >
                      Post as Promoted Job
                    </Text>
                  </Button>
                </Link>
                <Button
                  size="small"
                  type="default"
                  ghost
                  className="br-4"
                  onClick={postAsRegularJobHandler}
                >
                  <Text
                    className="text-small text-white text-semibol"
                  >
                    Post as Regular Job
                  </Text>
                </Button>
              </>
            )
          ) : null
        }
        {
          pricingState.type === 'FJ_EXAUSTED' ? (
            (
              <>
                <Row className="m-jp-footer">
                  <CustomImage src="/images/job-posting/warning.svg" height={20} width={16} alt="unlock" />
                  <Text className="display-flex text-small text-white">
                    You have exhausted your featured credits.
                    <br />
                    Buy more credits to make this a Promoted job.
                  </Text>
                </Row>
                <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                  <Button
                    size="small"
                    type="default"
                    style={{ background: '#FFCE32' }}
                    className="br-4"
                  >
                    <Text
                      className="text-small text-semibold"
                    >
                      Get Promoted job credits
                    </Text>
                  </Button>
                </Link>
                <Button
                  size="small"
                  type="default"
                  ghost
                  className="br-4"
                  onClick={postAsRegularJobHandler}
                >
                  <Text
                    className="text-small text-white text-semibol"
                  >
                    Post as Regular Job
                  </Text>
                </Button>
              </>
            )
          ) : null
        }
        {
          pricingState.type === 'CONTINUE_FJ' ? (
            <Space>
              <Button
                size="middle"
                type="default"
                style={{ background: '#FFCE32' }}
                className="br-4"
                onClick={saveAndCloseHandler}
              >
                <Text
                  className="text-base text-semibold"
                >
                  Save &amp; Close
                </Text>
              </Button>

            </Space>
          ) : null
        }
        {
          pricingState.type === 'POST_AS_FJ' ? (
            (
              <>
                <Row
                  justify="center"
                  align="middle"
                  className="m-jp-footer"
                >
                  <CustomImage src="/images/job-posting/feature-tag.svg" height={12} width={12} alt="tag" />
                  <Text className="display-flex text-small">
                    Promote this job to get 3x applications.
                  </Text>
                </Row>
                <Row
                  className="m-jp-text-link"
                >
                  <Space>
                    <Button
                      size="small"
                      type="default"
                      style={{ background: '#FFCE32' }}
                      className="br-4"
                      onClick={postAsFeatureJobHandler}
                    >
                      <Space>
                        <Text className="text-small text-semibold">Post as Promoted Job</Text>
                        <Avatar className="feature-credit-count" size="small">{pricingState?.featuredCredits}</Avatar>
                      </Space>
                    </Button>
                    <Button
                      size="middle"
                      type="default"
                      ghost
                      className="br-4"
                      onClick={postAsRegularJobHandler}
                    >
                      <Text
                        className="text-small text-white text-semibold"
                      >
                        Post as Regular Job
                      </Text>
                    </Button>
                  </Space>

                </Row>
              </>
            )
          ) : null
        }
        {
          pricingState.type === 'CONTINUE_AS_FR' ? (
            (
              <>
                <Row
                  justify="center"
                  align="middle"
                  className="m-jp-footer"
                >
                  <CustomImage src="/images/job-posting/feature-tag.svg" height={12} width={12} alt="tag" />
                  <Text className="display-flex text-small">
                    Promote this job to get 3x applications.
                  </Text>
                </Row>
                <Row
                  className="m-jp-text-link"
                >
                  <Space>
                    <Button
                      size="small"
                      type="default"
                      style={{ background: '#FFCE32' }}
                      className="br-4"
                      onClick={postAsFeatureJobHandler}
                    >
                      <Space>
                        <Text className="text-small text-semibold">Post as Promoted Job</Text>
                        <Avatar className="feature-credit-count" size="small">{pricingState?.featuredCredits}</Avatar>
                      </Space>
                    </Button>
                    <Button
                      size="middle"
                      type="default"
                      ghost
                      className="br-4"
                      onClick={postAsRegularJobHandler}
                    >
                      <Text
                        className="text-small text-white text-semibold"
                      >
                        Save &amp; Close
                      </Text>
                    </Button>
                  </Space>

                </Row>
              </>
            )
          ) : null
        }
        {
          pricingState.type === 'JP_EXAUSTED' ? (
            (
              <>
                <Row
                  className="m-jp-footer"
                  justify="center"
                >
                  <CustomImage src="/images/job-posting/warning.svg" height={20} width={16} alt="unlock" />
                  <Paragraph className="display-flex text-small p-left-22 font-bold">
                    No job posting credits left.
                    <br />
                    Use our premium plans to get more job posting credits
                  </Paragraph>
                </Row>
                <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                  <Button
                    size="small"
                    type="default"
                    style={{ background: '#FFCE32' }}
                    className="br-4 m-left-5"
                  >
                    <Text
                      className="text-small text-semibold"
                    >
                      Buy Job posting credits
                    </Text>
                  </Button>
                </Link>
              </>
            )
          ) : null
        }
      </>
    );

    const PricingCTAInfo = (): JSX.Element => (
      <>
        {
          pricingState.type === 'RENEW_AS_FR' ? (
            <Space>
              <Button
                size="middle"
                type="default"
                style={{ background: '#FFCE32' }}
                className="br-4"
                onClick={async ():Promise<void> => renewJobHandler('FEATURED')}
              >
                <Text
                  className="text-base text-semibold"
                >
                  Renew as Featured Job
                </Text>
              </Button>
              <Button
                size="middle"
                type="default"
                ghost
                className="br-4"
                onClick={async (): Promise<void> => renewJobHandler('REGULAR')}
              >
                <Text
                  className="text-base text-white text-semibol"
                >
                  Renew as Regular Job
                </Text>
              </Button>
            </Space>
          ) : null
        }
        {
          pricingState.type === 'RENEW_AS_FJ' ? (
            <Space>
              <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                <Button
                  size="middle"
                  type="default"
                  style={{ background: '#FFCE32' }}
                  className="br-4"
                >
                  <Text
                    className="text-base text-semibold"
                  >
                    Renew as Featured Job
                  </Text>
                </Button>
              </Link>
            </Space>
          ) : null
        }
        {
          pricingState.type === 'NEW_USER' ? (
            <Space>
              <Space>
                <CustomImage src="/images/job-posting/unlock.svg" height={20} width={16} alt="unlock" />
                <Text className="display-flex text-small text-white">
                  You have unlocked 2 regular job credits.
                </Text>
              </Space>
              <Button
                size="middle"
                type="default"
                style={{ background: '#FFCE32' }}
                className="br-4"
                onClick={postAsRegularJobHandler}
              >
                <Text
                  className="text-base text-semibold"
                >
                  Post as Regular Job
                </Text>
              </Button>
            </Space>
          ) : null
        }
        {
          pricingState.type === 'BUY_FJ' ? (
            (
              <Space>
                <Space>
                  <Text className="display-flex text-small text-white">
                    Buy featured credits and get 3x applications on your job.
                  </Text>
                </Space>
                <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                  <Button
                    size="middle"
                    type="default"
                    style={{ background: '#FFCE32' }}
                    className="br-4"
                    onClick={postAsFeatureJobHandler}
                  >
                    <Text
                      className="text-base text-semibold"
                    >
                      Post as Promoted Job
                    </Text>
                  </Button>
                </Link>
                <Button
                  size="middle"
                  type="default"
                  ghost
                  className="br-4"
                  onClick={postAsRegularJobHandler}
                >
                  <Text
                    className="text-base text-white text-semibol"
                  >
                    Post as Regular Job
                  </Text>
                </Button>
              </Space>
            )
          ) : null
        }
        {
          pricingState.type === 'FJ_EXAUSTED' ? (
            (
              <Space>
                <Space>
                  <CustomImage src="/images/job-posting/warning.svg" height={20} width={16} alt="unlock" />
                  <Text className="display-flex text-small text-white">
                    You have exhausted your featured credits.
                    <br />
                    Buy more credits to make this a Promoted job.
                  </Text>
                </Space>
                <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                  <Button
                    size="middle"
                    type="default"
                    style={{ background: '#FFCE32' }}
                    className="br-4"
                  >
                    <Text
                      className="text-base text-semibold"
                    >
                      Get Promoted job credits
                    </Text>
                  </Button>
                </Link>
                <Button
                  size="middle"
                  type="default"
                  ghost
                  className="br-4"
                  onClick={postAsRegularJobHandler}
                >
                  <Text
                    className="text-base text-white text-semibol"
                  >
                    Post as Regular Job
                  </Text>
                </Button>
              </Space>
            )
          ) : null
        }
        {
          pricingState.type === 'CONTINUE_FJ' ? (
            <Space>
              <Button
                size="middle"
                type="default"
                style={{ background: '#FFCE32' }}
                className="br-4"
                onClick={saveAndCloseHandler}
              >
                <Text
                  className="text-base text-semibold"
                >
                  Save &amp; Close
                </Text>
              </Button>
            </Space>
          ) : null
        }
        {
          pricingState.type === 'POST_AS_FJ' ? (
            (
              <Space>
                <Space>
                  <CustomImage src="/images/job-posting/feature-tag.svg" height={12} width={12} alt="tag" />
                  <Text className="display-flex text-small text-white">
                    Promote this job to get 3x applications.
                  </Text>
                </Space>
                <Button
                  size="middle"
                  type="default"
                  style={{ background: '#FFCE32' }}
                  className="br-4"
                  onClick={postAsFeatureJobHandler}
                >
                  <Space>
                    <Text className="text-base text-semibold">Post as Promoted Job</Text>
                    <Avatar className="feature-credit-count" size="small">{pricingState?.featuredCredits}</Avatar>
                  </Space>
                </Button>
                <Button
                  size="middle"
                  type="default"
                  ghost
                  className="br-4"
                  onClick={postAsRegularJobHandler}
                >
                  <Text
                    className="text-base text-white text-semibol"
                  >
                    Post as Regular Job
                  </Text>
                </Button>
              </Space>
            )
          ) : null
        }
        {
          pricingState.type === 'CONTINUE_AS_FR' ? (
            (
              <Space>
                <Space>
                  <CustomImage src="/images/job-posting/feature-tag.svg" height={12} width={12} alt="tag" />
                  <Text className="display-flex text-small text-white">
                    Promote this job to get 3x applications.
                  </Text>
                </Space>
                <Button
                  size="middle"
                  type="default"
                  style={{ background: '#FFCE32' }}
                  className="br-4"
                  onClick={postAsFeatureJobHandler}
                >
                  <Space>
                    <Text className="text-base text-semibold">Post as Promoted Job</Text>
                    <Avatar className="feature-credit-count" size="small">{pricingState?.featuredCredits}</Avatar>
                  </Space>
                </Button>
                <Button
                  size="middle"
                  type="default"
                  ghost
                  className="br-4"
                  onClick={postAsRegularJobHandler}
                >
                  <Text
                    className="text-base text-white text-semibol"
                  >
                    Save &amp; Close
                  </Text>
                </Button>
              </Space>
            )
          ) : null
        }
        {
          pricingState.type === 'JP_EXAUSTED' ? (
            (
              <Space>
                <Space>
                  <CustomImage src="/images/job-posting/warning.svg" height={20} width={16} alt="unlock" />
                  <Paragraph className="display-flex text-small text-white">
                    No job posting credits left.
                    <br />
                    Use our premium plans to get more job posting credits
                  </Paragraph>
                </Space>
                <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                  <Button
                    size="middle"
                    type="default"
                    style={{ background: '#FFCE32' }}
                    className="br-4"
                  >
                    <Text
                      className="text-base text-semibold"
                    >
                      Buy job posting credits
                    </Text>
                  </Button>
                </Link>
              </Space>
            )
          ) : null
        }
      </>
    );

    return (!state.OrgStoreFetching && !state.userDetailsFetching ? (
      <div className="parent-container">
        {/* Maps Start */}
        {/* <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${config.MAPS_API_KEY_FRONTEND}&libraries=places`}
        /> */}
        {/* Maps End */}
        {/* Stepper */}
        <Row>
          <Col xs={0} lg={{ span: 24 }}>
            <Container>
              <Row align="middle">
                <Col span={16} offset={4}>
                  <PageHeader className="jp-stepper-container" style={{ display: componentInfo.step !== 4 ? 'visible' : 'none' }}>
                    <Steps
                      size="small"
                      current={componentInfo.step - 1}
                    >
                      {
                        navigationSteps.map((step, index) => (
                          <Step
                            className="stepper-job-posting"
                            key={step.id}
                            icon={(index >= (componentInfo.step - 1))
                              && getNavStepIcon(step, index)}
                            title={index < (componentInfo.step - 1)
                              ? (
                                <Button
                                  type="link"
                                  className="p-all-0 auto-size"
                                  onClick={(): void => {
                                    router.Router.pushRoute(
                                      step.page,
                                      { id },
                                    );
                                  }}
                                >
                                  {step.title}
                                </Button>
                              ) : step.title}
                          />
                        ))
                      }
                    </Steps>
                  </PageHeader>
                </Col>
              </Row>
            </Container>
          </Col>

          <Col xs={{ span: 24 }} lg={{ span: 0 }}>
            <Row justify="space-between">
              <Col span={24}>
                <PageHeader className="m-jp-stepper-container">
                  <Row justify="space-between" align="middle">
                    <Col span={12}>
                      <Text className="m-jp-title">{stepTitle[componentInfo.step - 1]}</Text>
                    </Col>
                    <Col span={10}>
                      <Steps
                        size="small"
                        className="m-stepper-job-posting"
                        current={componentInfo.step - 1}
                      >
                        {
                          navigationSteps.map((step, index) => (
                            <Step
                              className="m-stepper-job-posting"
                              key={step.id}
                              title=""
                              icon=""
                            />
                          ))
                        }
                      </Steps>
                    </Col>
                  </Row>
                </PageHeader>
              </Col>
            </Row>
          </Col>
        </Row>
        {
          componentInfo.step === 3 ? (
            <>
              <Row>
                <Col
                  xs={{ span: 24, offset: 0 }}
                  lg={{ span: 24, offset: 0 }}
                  className="wrapper-component-container"
                  style={{ padding: '0 0 45px 0' }}
                >
                  {
                    jobAsFeatured ? (
                      <FeatureJobSuccessMessage
                        title={jobData?.title}
                        credits={pricingState?.featuredCredits - 1}
                      />
                    ) : (
                      <WrappedComponent
                        form={form}
                        orgstore={organizationStore}
                        userDetails={userDetailsStore}
                        isNewUser={isNewUser}
                      />
                    )
                  }

                </Col>
              </Row>
              <Row className="footer-container">
                <Container>
                  <Row justify="space-between">
                    <Col xs={{ span: 0 }} lg={{ span: 2 }}>
                      <Button
                        size="middle"
                        type="link"
                        ghost
                        onClick={handlePreviousClick}
                      >
                        <ArrowLeftOutlined className="text-base text-white" />
                        <Text
                          className="text-base text-white text-semibold p-left-8"
                        >
                          Previous
                        </Text>
                      </Button>
                    </Col>
                    <Col xs={{ span: 0 }} lg={{ span: 12 }} className="text-right">
                      <PricingCTAInfo />
                    </Col>
                    <Col xs={{ span: 24 }} lg={{ span: 0 }}>
                      <PricingCTAMobileInfo />
                    </Col>

                  </Row>
                </Container>
              </Row>
            </>
          ) : (
            <Row>
              {/* {componentInfo.step === 1
               && (<UnverifiedEmailModal isEmailModalVisible={abTestFlow !== '2'} />)} */}
              <Col
                xs={{ span: 24, offset: 0 }}
                lg={{ span: 0, offset: 2 }}
                className="wrapper-component-container"
                style={{ padding: '40px 0px 24px 14px' }}
              >
                <WrappedComponent
                  form={form}
                  orgstore={organizationStore}
                  userDetails={userDetailsStore}
                  isNewUser={isNewUser}
                  setIsNewUser={setIsNewUser}
                />

                <Row align="top" justify="center">
                  <Col span={24} className="text-center">
                    <Space>
                      {(componentInfo.step === 1 && !isNewUser) && (
                        <Link
                          href="/jobs"
                          as="/employer-zone/jobs/"
                        >
                          <Button
                            type="link"
                            onClick={():void => {
                              if (!id) {
                                pushClevertapEvent('New Job Post', {
                                  Type: 'New Job Post Cancel',
                                });
                              }
                            }}
                          >
                            Cancel

                          </Button>
                        </Link>
                      )}
                      {
                        componentInfo.step === 2 && (
                          <Button type="link" onClick={handlePreviousClick}>Back</Button>
                        )
                      }
                      {
                        componentInfo.step !== 4 && (
                          <Button
                            type="primary"
                            size="small"
                            style={{ padding: '0px 20px' }}
                            onClick={handleNextClick}
                          >
                            Continue
                          </Button>
                        )
                      }
                    </Space>
                  </Col>
                </Row>
              </Col>
              <Col
                xs={{ span: 0, offset: 0 }}
                lg={{ span: 20, offset: 2 }}
                className="wrapper-component-container"
                style={{ padding: '67px 100px 45px' }}
              >
                <WrappedComponent
                  form={form}
                  orgStore={organizationStore}
                  userDetails={userDetailsStore}
                  isNewUser={isNewUser}
                  setIsNewUser={setIsNewUser}
                  jpCredits={pricingState?.JPCredits}
                />
                <Row align="middle" justify="center">
                  <Col span={24} className="text-center">
                    <Space>
                      {
                        (componentInfo.step === 1 && !isNewUser) && (
                          <Link
                            href="/jobs"
                            as="/employer-zone/jobs/"
                          >
                            <Button
                              type="link"
                              onClick={():void => {
                                if (!id) {
                                  pushClevertapEvent('New Job Post', {
                                    Type: 'New Job Post Cancel',
                                  });
                                }
                              }}
                            >
                              Cancel

                            </Button>
                          </Link>
                        )
                      }
                      {
                        componentInfo.step === 2 && (
                          <Button type="link" onClick={handlePreviousClick}>Back</Button>
                        )
                      }

                      {
                        componentInfo.step !== 4 && (
                          <Button
                            type="primary"
                            size="small"
                            style={{ padding: '0px 20px' }}
                            onClick={handleNextClick}
                          >
                            Continue
                          </Button>
                        )
                      }
                    </Space>
                  </Col>
                </Row>
              </Col>
            </Row>
          )
        }
      </div>
    ) : (
      <>
        <div className="text-center hero-text">Loading...</div>
        <Spin className="section-loader" indicator={<LoadingOutlined />} />
      </>
    ));
  };
  JobPostingHOC.getInitialProps = async (ctx): Promise<{id:string, duplicateId:string}> => ({ id: (ctx && ctx.query && ctx.query.id) || '', duplicateId: (ctx && ctx.query && ctx.query.duplicateId) || '' });
  return observer(JobPostingHOC);
};

export default WithJobPostingHOC;
