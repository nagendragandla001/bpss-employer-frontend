/* eslint-disable quote-props */
/* eslint-disable dot-notation */
import {
  Button, Col, Divider, Dropdown, Progress, Row, Space, Tooltip, Typography,
} from 'antd';
import JobPostingGuidelines from 'components/JobPostingGuidelinesModal';
import UnverifiedModal from 'components/UnverifiedEmailNotification/UnverifiedModal';
import CustomImage from 'components/Wrappers/CustomImage';
import dayjs from 'dayjs';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import { PricingStats } from 'screens/authenticated/jobPostingStep4/commonTypes';
import ActiveModal from 'screens/authenticated/JobsTab/Common/ActiveModal/index';
import CloseJobModal from 'screens/authenticated/JobsTab/Common/CloseJobModal';
import DuplicateJobModal from 'screens/authenticated/JobsTab/Common/DuplicateJobModal';
import {
  applicationStages,
  ApplicationStatsType, IJobsTabDispatch, jobPostingSteps, JobType,
  openapplicationStages,
  OrgDetailsType, updateSlotsDataObjectType,
} from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import AddSlotsDrawer from 'screens/authenticated/JobsTab/Desktop/addSlots/index';
import JobCardBanner from 'screens/authenticated/JobsTab/Desktop/jobCardBanner';
import JobsCardSkeleton from 'screens/authenticated/JobsTab/Desktop/jobCardsSkeleton';
import { getLoggedInUser } from 'service/accounts-settings-service';
import { upgradeJob } from 'service/job-service';
import { setUrlParams } from 'service/url-params-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { DesktopMoreDropDownMenuItems } from '../Common/MoreDropDownMenuItems';
import { DesktopShareDropDownMenuItems } from '../Common/ShareDropDownMenuItems';
import JobExpiryModal from './jobExpiry';

const { Text, Paragraph } = Typography;

interface PropsInterface {
  jobs: JobType[];
  dataLoading: boolean;
  currentTab: string;
  remainingFreeCredits: number;
  remainingJPCredits: number;
  loggedInUserId: string;
  updateJobsData: (validTill: string, jobId: string) => void;
  orgDetails: OrgDetailsType;
  updateJobsSlotsData: (updateObject:updateSlotsDataObjectType, jobId: string) => void;
  // setRefresh: (refresh: boolean)=>void;
  dispatch: (data: IJobsTabDispatch) =>void;
  refresh: boolean;
  pricingStats: PricingStats;
}

interface MandDStateInterface{
  visible:boolean;
  job: JobType | null,
  type: 'addSlots' | 'jobExpiry' | 'jobPostingGuidelinesModal' | 'activeModal' | ''
}

type JobApplicationStatsType = {
  currentTab: string;
  applicationStats: ApplicationStatsType
  jobStage: string;
  jobId: string;
  pricingType: string;
  databaseRecommendationCount: number;
  newApplications: number;
}

export const JobApplicationStats = (props: JobApplicationStatsType): JSX.Element => {
  const {
    applicationStats, currentTab, jobStage, jobId, pricingType,
    databaseRecommendationCount, newApplications,
  } = props;
  const isDisabled = ['unapproved', 'paused', 'closed'].includes(currentTab) && ['J_UA', 'J_P', 'J_C', 'J_A'].includes(jobStage);

  const handleApplicationStage = (value: string): void => {
    if (!isDisabled) {
      const params = [] as any;

      switch (value) {
        case 'applied': {
          params.push({ Applied: true });
          pushClevertapEvent('Special Click', {
            Type: 'View Applications',
            JobType: pricingType,
          });
          break;
        }
        case 'interviews': {
          params.push({ 'Interview': true });
          break;
        }
        case 'selected': {
          params.push({ 'Selected': true });
          break;
        }
        case 'database': {
          params.push({ tab: 'database' });
          pushClevertapEvent('Special Click', {
            Type: 'View Database',
            JobType: pricingType,
          });
          break;
        }
        default: break;
      }

      params.push({ job: jobId });
      setUrlParams(params);
    }
  };

  return (
    <>
      {currentTab === 'drafts' || currentTab === 'open' ? null : (
        <>
          <Row className="p-top-8" justify="end">
            {applicationStages.map((item) => (
              <Col
                onClick={(): void => {
                  handleApplicationStage(item.value);
                }}
                className={`app-stat-box ${isDisabled ? 'app-stat-box-disabled' : ''}`}
                key={item.value}
              >
                <Text className="text-small">
                  {item.label}
                </Text>
                <Text className="text-extra-base" style={{ color: '#00BA88' }}>
                  {applicationStats[item.value]}
                </Text>
              </Col>
            ))}
          </Row>
        </>
      )}
      {currentTab === 'open' ? (
        <>
          <Row className="p-top-4" justify="start" gutter={[16, 8]}>
            {openapplicationStages.map((item) => (
              <Col span={10} onClick={(): void => handleApplicationStage(item.value)} className={`app-stat-box ${isDisabled ? 'app-stat-box-disabled' : ''}`} key={item.value}>
                <Text
                  type="secondary"
                  className="text-small"
                  style={{ color: '#B4B7BD' }}
                >
                  {item.label}
                </Text>
                <Text
                  className="text-extra-base"
                  style={item.label === 'Applied' ? { color: '#00BA88' } : { color: '#001443' }}
                >
                  {/* {item.value === 'applied'
                    ? applicationStats.totalApplications : 'FIND CANDIDATES'} */}
                  {item.value === 'applied' ? applicationStats.totalApplications : databaseRecommendationCount}
                </Text>
              </Col>
            ))}
            {newApplications > 0 && (
              <Col className="new-applications-count-container" span={8}>
                <Text className="new-applications-count">
                  {`${newApplications} New`}
                </Text>
              </Col>
            )}

          </Row>
        </>
      ) : null}
    </>
  );
};

const JobCards = (props: PropsInterface): JSX.Element => {
  const {
    jobs, dataLoading, currentTab,
    remainingFreeCredits, remainingJPCredits,
    loggedInUserId, updateJobsData, orgDetails,
    updateJobsSlotsData, dispatch, refresh, pricingStats,
  } = props;

  const [unverifiedModalFlag, setUnverifiedModalFlag] = useState<boolean>(false);
  const [closeJobModalFlag, setCloseJobModalFlag] = useState<boolean>(false);
  const [closeJobId, setCloseJobId] = useState<string | null>(null);
  const [duplicateJobModalFlag, setDuplicateJobModalFlag] = useState<boolean>(false);
  const [duplicateJobId, setDuplicateJobId] = useState<string | null>(null);

  const [user, setUser] = useState() as any;

  const setLoggedInUser = async (): Promise<void> => {
    const apiCall = await getLoggedInUser();
    const response = apiCall.data;
    setUser(response?.objects[0]);
  };
  useEffect(() => {
    setLoggedInUser();
  }, []);

  const [drawerAndModalInfo, setDrawerAndModalInfo] = useState<MandDStateInterface>({
    type: '',
    job: null,
    visible: false,
  });

  const featureJobHandler = async (jobId, planType): Promise<void> => {
    pushClevertapEvent('Special Click',
      {
        Type: 'Feature Job',
        Source: 'Upgrade Banner',
        'Job State': currentTab,
      });

    if (planType === 'FR') {
      if (pricingStats?.total_pricing_stats?.FJ?.remaining) {
        const planId = pricingStats?.plan_wise_pricing_stats[0]?.id;
        const featureApiCall = await upgradeJob({ job_ids: [jobId], plan_id: planId });
        if ([200, 201, 202].includes(featureApiCall.status)) {
          // setRefresh(!refresh);
          dispatch({
            type: 'UPDATEJOBSTABSTATE',
            payload: {
              refresh: !refresh,
            },
          });
        }
      } else {
        router.Router.pushRoute('PricingPlans');
      }
    }
  };

  return (
    <>
      {dataLoading ? <JobsCardSkeleton currentTab={currentTab} />
        : (
          <>
            {unverifiedModalFlag ? <UnverifiedModal isEmailModalVisible /> : null}
            {jobs && jobs.map((job) => (
              <Row className={`job-card-container${currentTab === 'drafts' ? ' draft-card-container' : ''}`} key={job.id}>
                <Col span={24}>
                  {/* Job Details and Application Stats of job */}
                  <Row className="job-details-container">
                    <Col span={14} className="job-title">
                      {/* For Active jobs show tag here */}
                      <Space direction="vertical">
                        {currentTab === 'drafts' ? <Text className="font-bold color-blue-grey-5 text-small">DRAFT</Text> : null}
                        {(job.pricingPlanType === 'JP' && currentTab !== 'drafts')
                          ? (
                            <Space direction="horizontal" className="promoted-job-container">
                              <Text>
                                <CustomImage
                                  src="/images/jobs-tab/promoted-job-icon.svg"
                                  width={14}
                                  height={14}
                                  alt="premium icon"
                                />
                                {' '}
                                Promoted Job
                              </Text>
                            </Space>
                          )
                          : null}
                        {(job.pricingPlanType === 'FR'
                        && job.isActive && currentTab !== 'drafts')
                          ? <Text className="font-bold color-red-7 text-small">ACTIVE</Text>
                          : null}
                        <Space className="full-width">
                          <Link
                            href={{
                              pathname: '/jobdetails',
                              query: {
                                id: job.id,
                              },
                            }}
                            as={`/employer-zone/jobs/${job.id}`}
                          >
                            <Tooltip
                              title="View Job Details"
                            >
                              <Button
                                type="link"
                                className="title-container"
                                onClick={(): void => {
                                  pushClevertapEvent('Special Click',
                                    {
                                      Type: 'Job Title',
                                      'Job Type': job.pricingPlanType,
                                      'Job State': currentTab,
                                    });
                                }}
                              >
                                <Paragraph ellipsis className="text-large font-bold text-capitalize">
                                  {job.title}
                                </Paragraph>
                              </Button>
                            </Tooltip>
                          </Link>

                          {currentTab !== 'closed'
                            ? (
                              <Link
                                href={{
                                  pathname: 'jobPostFormBasicDetails',
                                  query: {
                                    id: job.id,
                                  },
                                }}
                                as={`/employer-zone/job-posting/edit/${job.id}/job-specs/`}
                              >
                                <Button
                                  type="text"
                                  className="title-edit-button"
                                  onClick={(): void => {
                                    pushClevertapEvent('Special Click',
                                      {
                                        Type: 'Edit Job',
                                        'Job Type': job.pricingPlanType,
                                        'Job State': currentTab,
                                      });
                                  }}
                                >
                                  <CustomImage
                                    src="/images/jobs-tab/job-edit-icon.png"
                                    height={12}
                                    width={12}
                                    alt="pencil Icon"
                                    className="p-right-2"
                                  />
                                  &nbsp;
                                  Edit
                                </Button>
                              </Link>
                            )
                            : null}
                        </Space>

                        <Space direction="vertical">
                          <Text className="text-base color-blue-grey-5 p-top-8">
                            <CustomImage
                              src="/images/jobs-tab/location-icon.png"
                              alt="location-icon"
                              width={12}
                              height={12}
                            />
                          &nbsp;
                            {`${job.jobCityAndState} - ${job.location}`}
                          </Text>
                          <Text className="text-base color-blue-grey-5 p-top-8">
                            <CustomImage
                              src="/images/jobs-tab/salary-icon.png"
                              alt="location-icon"
                              width={12}
                              height={12}
                            />
                            &nbsp;
                            &#x20b9;
                            {job.minSalary}
                            {' '}
                            {' - '}
                            &#x20b9;
                            {job.maxSalary}
                          </Text>
                          {job.callHR
                        && (
                          <Tooltip
                            title={`POC Name : ${job?.pocName}`}
                          >
                            <Text
                              className="text-small text-center"
                              style={{
                                background: '#00BA88',
                                borderRadius: '4px',
                                padding: '4px',
                                color: 'white',
                              }}
                            >
                              <CustomImage
                                src="/images/jobs-tab/call-hr-icon.png"
                                alt="call HR icon"
                                width={12}
                                height={12}
                              />
                              &nbsp;
                              Call HR enabled
                            </Text>
                          </Tooltip>
                        )}
                        </Space>
                      </Space>
                    </Col>

                    <Col span={10} className="app-stats-container">
                      <Row className="app-stats-candidate-count">
                        <Col span={24}>
                          <JobApplicationStats
                            currentTab={currentTab}
                            applicationStats={job.applicationStats}
                            jobStage={job.stage}
                            jobId={job.id}
                            pricingType={job.pricingPlanType}
                            databaseRecommendationCount={job?.databaseRecommendationCount}
                            newApplications={job?.newApplications}
                          />
                        </Col>
                      </Row>

                      {((currentTab === 'open' || currentTab === 'unapproved') && job.jobType === 'NCAR') ? (
                        <Row className="slot-details-container">
                          <Col span={24} className={`flex-align-center ${job.recentSlot ? '' : 'flex-end'}`}>
                            <Text className={`flex-align-center text-base ${job.recentSlot ? 'color-blue-grey-5' : 'color-red-7'}`}>
                              <div className="padding-right-8">
                                <CustomImage
                                  src={`/images/jobs-tab/${job.recentSlot ? '' : 'disabled-'}calendar-icon-24x24.svg`}
                                  alt="calendar icon"
                                  width={24}
                                  height={24}
                                />
                              </div>
                              {job.recentSlot ? 'Next Walk-in Slots:' : 'No Interview Slots Available'}
                            </Text>
                            &nbsp;
                            { job.recentSlot ? (
                              <Text className="text-base">
                                {job.recentSlot}
                              </Text>
                            ) : (
                              <Button
                                className="display-flex text-small font-bold add-slots-btn"
                                type="primary"
                                onClick={():void => {
                                  setDrawerAndModalInfo({
                                    job,
                                    type: 'addSlots',
                                    visible: true,
                                  });
                                  pushClevertapEvent('Special Click',
                                    {
                                      Type: 'Add slots',
                                      'Job Type': job.pricingPlanType,
                                      'Job State': currentTab,
                                    });
                                }}
                              >
                                Add Interview Slots
                              </Button>
                            )}
                          </Col>
                        </Row>
                      ) : null}
                      {currentTab === 'paused' && (
                        <Row className="renew-job-container" justify="end">
                          <Col>
                            <JobExpiryModal
                              isPaused
                              validTill={job?.validTill || ''}
                              pricingPlanType={job?.pricingPlanType}
                              remainingFreeCredits={remainingFreeCredits}
                              remainingJPCredits={remainingJPCredits}
                              loggedInUserId={loggedInUserId}
                              jobId={job.id}
                              postedOn={job?.postedOn}
                              jobTitle={job?.title}
                              updateJobsData={updateJobsData}
                              pausedOn={job?.pausedOn}
                              page={false}
                              button
                              orgId={orgDetails?.orgId}
                            />
                          </Col>
                        </Row>

                      )}

                    </Col>
                  </Row>

                  {(currentTab === 'drafts' || (currentTab === 'open' && !job.banner)) ? null : (
                    <Row className={`job-tag-container ${(job.banner === 'premiumPromotion'
                    && currentTab === 'open') ? 'm-all-0' : ''}`}
                    >
                      <Col span={24}>
                        <JobCardBanner
                          job={job}
                          currentTab={currentTab}
                          user={user}
                          setDrawerAndModalInfo={setDrawerAndModalInfo}
                          setUnverifiedModalFlag={setUnverifiedModalFlag}
                          remainingFreeCredits={remainingFreeCredits}
                          remainingJPCredits={remainingJPCredits}
                          loggedInUserId={loggedInUserId}
                          updateJobsData={updateJobsData}
                          orgDetails={orgDetails}
                          featureJobHandler={featureJobHandler}
                        />
                      </Col>
                    </Row>
                  )}

                  {/* Job Completion Percentage in case of Drafts */}
                  {currentTab === 'drafts' ? (
                    <Progress
                      percent={job.completionScore}
                      showInfo={false}
                      className="draft-progress-bar"
                      trailColor="#e0e0e0"
                    />
                  ) : <Divider className="divider" />}

                  {/* Job cards Footer - CTA'S */}
                  <Row className={`job-card-footer${currentTab === 'drafts' ? ' draft-footer' : ''}`}>
                    <Col span={12} className={`display-flex ${currentTab === 'drafts' ? '' : 'margin-right-2rem'}`}>
                      {currentTab === 'drafts' ? (
                        <Row>
                          <Col>
                            <Text className="color-blue-grey-5 text-small">You were editing</Text>
                            <br />
                            <Text className="text-base">{jobPostingSteps[job.currentStep].title}</Text>
                          </Col>
                        </Row>
                      ) : (
                        <>
                          {['open', 'paused', 'unapproved'].includes(currentTab) ? (
                            <Dropdown
                              overlay={(
                                <DesktopShareDropDownMenuItems
                                  jobId={job.id}
                                  jobSlug={job.slug}
                                  jobLocation={job.location}
                                  jobTitle={job.title}
                                  orgName={job.orgName}
                                  orgPopularName={job.orgPopularName}
                                  currentTab={currentTab}
                                />
                              )}
                              placement="bottomLeft"
                              trigger={['click']}
                            >
                              <Button
                                className="link-btn font-bold"
                                onClick={():void => {
                                  pushClevertapEvent('Special Click',
                                    {
                                      Type: 'Share Job',
                                      'Job Type': job.pricingPlanType,
                                      'Job State': currentTab,
                                    });
                                }}
                              >
                                <CustomImage
                                  src="/images/jobs-tab/share-icon-24x24.svg"
                                  height={24}
                                  width={24}
                                  alt="share Icon"
                                  className="p-right-2"
                                />
                                Share
                              </Button>
                            </Dropdown>
                          ) : null}
                          {currentTab === 'open' ? (
                            <>
                              {(job.pricingPlanType === 'FR' && job.banner !== 'premiumPromotion') ? (
                                <Button
                                  className="link-btn font-bold"
                                  onClick={
                                    (): Promise<void> => featureJobHandler(job.id,
                                      job.pricingPlanType)
                                  }
                                >
                                  <CustomImage
                                    src="/images/jobs-tab/trending-up-icon.svg"
                                    width={20}
                                    height={20}
                                    alt="upgrade Icon"
                                    className="p-right-2"
                                  />
                                  &nbsp;
                                  Promote job
                                </Button>
                              ) : null}
                              <Dropdown
                                overlay={(
                                  <DesktopMoreDropDownMenuItems
                                    id={job.id}
                                    pricingPlanType={job.pricingPlanType}
                                    setCloseJobModalFlag={setCloseJobModalFlag}
                                    setCloseJobId={setCloseJobId}
                                    currentTab={currentTab}
                                    setDuplicateJobModalFlag={setDuplicateJobModalFlag}
                                    setDuplicateJobId={setDuplicateJobId}
                                  />
                                )}
                                placement="topLeft"
                                trigger={['click', 'hover']}
                              >
                                <Button
                                  className="link-btn font-bold"

                                >
                                  <CustomImage
                                    src="/images/jobs-tab/more-icon.svg"
                                    height={4}
                                    width={18}
                                    alt="share Icon"
                                    className="p-right-2"
                                  />
                                  &nbsp;
                                  More Options
                                </Button>
                              </Dropdown>
                            </>
                          ) : null}
                          {(currentTab !== 'open' && currentTab !== 'drafts' && job.stage !== 'J_R') ? (
                            <Button
                              type="text"
                              className="link-btn font-bold "
                              onClick={():void => {
                                pushClevertapEvent('Special Click',
                                  {
                                    Type: 'Duplicate Job',
                                    'Job Type': job.pricingPlanType,
                                    'Job State': currentTab,
                                  });
                                setDuplicateJobModalFlag(true);
                                setDuplicateJobId(job.id);
                              }}
                            >
                              <CustomImage
                                src="/images/jobs-tab/duplicate-job-icon-24x24.svg"
                                height={15}
                                width={15}
                                alt="share Icon"
                                className="p-right-2"
                              />
                              &nbsp;
                              Duplicate job
                            </Button>
                          ) : null}
                        </>
                      )}
                    </Col>
                    <Col span={12} className={`${currentTab === 'drafts' ? 'draft-footer-btn' : 'app-stats-container display-flex flex-align-items-center'}`}>
                      {currentTab === 'drafts' ? (
                        <Button
                          type="primary"
                          className="primary-btn"
                          onClick={(): void => {
                            router.Router.pushRoute(
                              jobPostingSteps[job.currentStep].page,
                              { id: job.id },
                            );
                            pushClevertapEvent('Special Click',
                              {
                                Type: 'Complete Posting',
                                'Job State': currentTab,
                              });
                          }}
                        >
                          Complete Posting
                        </Button>
                      ) : (
                        <Paragraph className="color-blue-grey-5 text-small" ellipsis>
                          {`Posted on ${job.postedOn ? dayjs(job.postedOn).format('MMM DD') : '--'} by ${job.postedBy ? job.postedBy : '--'}`}
                        </Paragraph>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            ))}
            {closeJobModalFlag ? (
              <CloseJobModal
                setCloseJobModalFlag={setCloseJobModalFlag}
                closeJobId={closeJobId}
                refresh={refresh}
                dispatch={dispatch}
                // setRefresh={setRefresh}
              />
            ) : null}
            {duplicateJobModalFlag ? (
              <DuplicateJobModal
                setDuplicateJobModalFlag={setDuplicateJobModalFlag}
                duplicateJobId={duplicateJobId}
              />
            ) : null}
          </>
        )}
      {drawerAndModalInfo.type === 'addSlots' && drawerAndModalInfo.job
        ? (
          <AddSlotsDrawer
            orgDetails={orgDetails}
            closeDrawer={():void => setDrawerAndModalInfo({ type: '', visible: false, job: null })}
            jobId={drawerAndModalInfo.job.id}
            updateJobsSlotsData={updateJobsSlotsData}
          />
        ) : null}
      {drawerAndModalInfo.type === 'jobPostingGuidelinesModal'
        ? (
          <JobPostingGuidelines
            onCloseHandler={():void => setDrawerAndModalInfo({ type: '', visible: false, job: null })}
          />
        ) : null}
      {drawerAndModalInfo.type === 'activeModal'
        ? (
          <ActiveModal
            onCloseHandler={():void => setDrawerAndModalInfo({ type: '', visible: false, job: null })}
          />
        ) : null}
    </>
  );
};

export default JobCards;
