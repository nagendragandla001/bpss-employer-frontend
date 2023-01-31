/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loading3QuartersOutlined, PlusOutlined } from '@ant-design/icons';
import { useLazyQuery } from '@apollo/client';
import {
  Button, Card, Col, Row, Spin, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import DatabaseFilterComponent from 'components/StaticPages/Common/MobileFilter/DatabaseFilterComponent';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import AppConstants from 'constants/constants';
import snackBar from 'components/Notifications';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import {
  flatDatabaseDataFunc,
} from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import MAddonExhaustedModal from 'screens/authenticated/ApplicationsTab/Mobile/MAddonExhausted';
import MobileApplicationCard from 'screens/authenticated/ApplicationsTab/Mobile/mobileApplicationCard';
import { bulkUnlockContactAPI, getUnlockCandidatesInfo } from 'service/application-card-service';
import { ContextType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';
import { getGraphqlFiltes } from 'screens/authenticated/ApplicationsTab/Common/DatabaseTabUtils';
import { findRecommendedCandidatesForEmployer } from 'screens/authenticated/ApplicationsTab/Desktop/recommendedApiQuery';

require('screens/authenticated/ApplicationsTab/Mobile/applicationsTabMobile.less');

const { Text } = Typography;

const EmptyApplicationCard = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyApplicationCard'), { ssr: false });
const EmptyMessage = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyMessage'), { ssr: false });
const QuickFilters = dynamic(() => import('components/Candidates/QuickFilters'), { ssr: false });

interface StateInterface{
  applicationData: any;
  totalApplications: number;
  loading: boolean,
  offset: number,
  isEmpty?: boolean,
}
interface PropsI {
  selectedTab: string;
  context: ContextType;
  orgId: string;
  orgName: string;
}

interface JobType {
  id: string;
  title: string;
}

const ModalTypes = {
  creditsExaust: {
    title: 'Database Unlocks Exhausted',
    description: 'Upgrade your plan, or buy add ons to get more unlock credits',
    action: 'getMoreCredits',
  },
  insufficientCredits: {
    title: 'Insufficient Database Unlocks',
    description: 'You do not have sufficient credits for this action. To unlock more candidates, please buy another plan.',
    action: 'upgradePlan',
  },
};

const DatabaseMobileScreen = (props:PropsI): JSX.Element => {
  const {
    selectedTab, context, orgId, orgName,
  } = props;
  const { databaseUnlocksLeft, totalDatabaseUnlocks } = context;
  const [state, setState] = useState<StateInterface>({
    applicationData: [],
    totalApplications: 0,
    loading: false,
    offset: 0,
    isEmpty: false,
  });

  const [fetchGraphqlData, {
    error,
    loading: recommendLoading,
    data: recommendData,
    fetchMore,
  }] = useLazyQuery(findRecommendedCandidatesForEmployer, {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  const [filter, setFilter] = useState([]) as any;
  const [addOnModal, setAddOnModal] = useState('');

  const [selectedJob, setSelectedJob] = useState<JobType>({
    id: '',
    title: '',
  });

  const showSnackbar = (description:string,
    iconName:string, notificationType: string) :void => {
    snackBar({
      title: '',
      description,
      iconName,
      notificationType,
      placement: 'bottomRight',
      duration: 5,
    });
  };

  const getMoreApplicationData = (): void => {
    setTimeout(() => {
      if (!state.loading && selectedTab === 'database' && state.applicationData.length < 50) {
        if (fetchMore) {
          setState((prevState) => ({
            ...prevState,
            offset: prevState.offset + 10,
            loading: true,
          }));

          fetchMore({
            variables: {
              job_id: selectedJob.id,
              filter: getGraphqlFiltes(filter, orgId),
              first: 10,
              after: state.offset + 10,
            },
            updateQuery: (prev, { fetchMoreResult }): any => {
              if (!fetchMoreResult) return prev;
              return {
                ...fetchMoreResult,
                findRecommendedCandidatesForEmployer: {
                  ...fetchMoreResult.findRecommendedCandidatesForEmployer,
                  edges: [...fetchMoreResult.findRecommendedCandidatesForEmployer.edges,
                    ...prev.findRecommendedCandidatesForEmployer.edges],
                },
              };
            },
          });
        }
      }
    });
  };

  const updateUnlockContactHandler = async (id): Promise<void> => {
    if (context.databaseUnlocksLeft > 0) {
      const postObj = [{ candidate_id: id }];
      const apiRespone = await bulkUnlockContactAPI(postObj);
      const response = await apiRespone.data;
      if ([200, 201, 202].indexOf(apiRespone.status)) {
        context.setdatabaseUnlocksLeft(
          context.databaseUnlocksLeft - 1,
        );

        if (response && response.length > 0) {
          setState((prevState) => ({
            ...prevState,
            applicationData: [...prevState.applicationData].map((app) => {
              if (app.candidateId === id) {
                return {
                  ...app,
                  candidateContactUnblocked: true,
                  candidateMobileNo: response[0]?.unlocked_user?.mobile,
                  candidateEmail: response[0]?.unlocked_user?.email,
                };
              }
              return app;
            }),
          }));
        }

        if (response && response.length > 0) {
          showSnackbar('Contact Unlocked', 'congratsIcon.svg',
            'info');
        } else {
          showSnackbar('Something went wrong!', 'rejectedIcon.png',
            'error');
        }
        // setContactData(response.unlocked_user)
      } else if (apiRespone.response.status === 400
      && apiRespone.response.data.type === 'UnlockContactLimitReachedError') {
        setAddOnModal('insufficientCredits');
      }
    } else {
      setAddOnModal('creditsExaust');
    }
  };

  const setDatabaseData = async (): Promise<void> => {
    if ((filter && filter.length > 0) || selectedJob.id) {
      fetchGraphqlData({
        variables: {
          job_id: selectedJob.id,
          filter: getGraphqlFiltes(filter, orgId),
          first: 10,
          after: state.offset,
          preSkilled: filter?.filter?.includes('pre_skilled'),
        },
      });
    } else {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        applicationData: [],
        totalApplications: 0,
        isEmpty: true,
      }));
    }
  };

  const handleChange = (data: JobType):void => {
    setSelectedJob({
      id: data.id,
      title: data.title,
    });
  };

  const handleFilter = (data):void => {
    setFilter(data);
  };

  const updateDismissedCandidateHandler = (id): void => {
    const undismissCandidates = [...state.applicationData].filter((app) => app.candidateId !== id);
    if (undismissCandidates.length === 0) {
      setDatabaseData();
    } else {
      setState((prevState) => ({
        ...prevState,
        applicationData: undismissCandidates,
      }));
    }
  };

  useEffect(() => {
    setDatabaseData();
  }, [selectedJob.id, filter]);

  useEffect(() => {
    if (error) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        applicationData: [],
        totalApplications: 0,
        isEmpty: true,
      }));
    }
    if (recommendData && recommendData.findRecommendedCandidatesForEmployer
      && recommendData.findRecommendedCandidatesForEmployer.edges.length > 0) {
      (async (): Promise<void> => {
        const unlockedContacts = recommendData.findRecommendedCandidatesForEmployer.edges
          .filter((contact) => contact.is_unlocked).map((c) => ({ candidate_id: c.id }));

        if (unlockedContacts.length > 0) {
          const unlockData = await getUnlockCandidatesInfo(unlockedContacts);
          const response = await unlockData.data;
          const map = new Map(response.map((a) => [a.candidate, a]));
          const result = recommendData.findRecommendedCandidatesForEmployer.edges
            .map((o) => ({ ...o, ...map.get(o.id) as any }));
          recommendData.findRecommendedCandidatesForEmployer.edges = result;
        }
        const cmsResult = recommendData.findRecommendedCandidatesForEmployer.edges.map((edge) => {
          const res = edge?.cms?.required_criteria?.map((c) => {
            if (c.value && (c.type === 'education' || c.type === 'experience')) {
              return {
                name: c.type === 'education' ? c.value[0] : c.value,
                type: c.type,
                status: c.status,
              };
            }
            return c;
          });

          return { ...edge, cms: { ...edge.cms, required_criteria: res } };
        });

        recommendData.findRecommendedCandidatesForEmployer.edges = cmsResult;

        const graphqldata = flatDatabaseDataFunc(
          recommendData?.findRecommendedCandidatesForEmployer,
          { jobId: selectedJob.id, jobTitle: selectedJob.title },
        );

        if (graphqldata.DatabaseData && graphqldata.DatabaseData.length > 0) {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            applicationData: graphqldata.DatabaseData,
            totalApplications: graphqldata.applicationsCount,
            isEmpty: false,
          }));
        } else {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            totalApplications: 0,
            isEmpty: false,
          }));
        }
      })();
    } else {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        totalApplications: 0,
        applicationData: [],
        isEmpty: true,
      }));
    }

    if (recommendLoading) {
      setState((prevState) => ({
        ...prevState,
        loading: true,
      }));
    }
  }, [recommendData, recommendLoading, error]);

  return (
    <>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Applications | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Applications | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      <Container>
        <UnverifiedEmailNotification />
        <Row className="at-mobile-background-charcoal-3">
          <Col span={24}>
            <DatabaseFilterComponent
              filter={filter}
              callback={handleChange}
              callbackfilter={handleFilter}
              count={state.totalApplications ? state.totalApplications : 0}
              orgId={orgId}
              context={context}
              orgName={orgName}
            />
          </Col>
          <Col span={24}>
            <QuickFilters filter={filter} callbackfilter={handleFilter} selectedTab={selectedTab} />
          </Col>
          <Col xs={{ span: 24 }} className="at-mobile-total-applications">
            {`${state.totalApplications > 50 ? 50 : state.totalApplications} Candidates`}
          </Col>
          <Col xs={{ span: 24 }}>
            {
              state.totalApplications > 0 ? (
                <MobileApplicationCard
                  applications={state.applicationData}
                  getMoreApplicationData={getMoreApplicationData}
                  setApplicationData={setState}
                  selectedTab={selectedTab}
                  updateDismissedCandidate={updateDismissedCandidateHandler}
                  updateUnlockContact={updateUnlockContactHandler}
                  orgName={orgName}
                />
              ) : state.isEmpty ? <EmptyApplicationCard selectedTab={selectedTab} /> : <EmptyMessage selectedTab="database" />
            }
            {/* Loading State */}
            {state.loading
              ? <Spin className="at-mobile-spinner" indicator={<Loading3QuartersOutlined style={{ fontSize: '2rem' }} spin />} />
              : null}
          </Col>
          <Col span={24}>
            <Card className="m-app-account-summary">
              <Row align="middle">
                <Col span={24}>
                  <Row gutter={8} align="middle">
                    <Col span={18}>
                      <Row align="middle">
                        <Col span={8}>
                          <Text className="ftext-small">
                            {totalDatabaseUnlocks - databaseUnlocksLeft}
                            /
                          </Text>
                          <Text className="text-small description">
                            {totalDatabaseUnlocks}
                          </Text>
                        </Col>
                        <Col span={16}>
                          <Text ellipsis style={{ maxWidth: '100%' }} className="font-bold">Database Unlocks Used</Text>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={6}>
                      <Button
                        type="primary"
                        shape="round"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={(): void => {
                          router.Router.pushRoute('PricingPlans');
                        }}
                      >
                        ADD
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col span={24}>
                  <Text className="text-small text-note">*Our fair usage policy allows for a maximum of 999 unlocks</Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        {
          addOnModal !== '' ? (
            <MAddonExhaustedModal
              visible
              title={ModalTypes[addOnModal].title}
              description={ModalTypes[addOnModal].description}
              handleCancel={():void => { setAddOnModal(''); }}
            />
          ) : null
        }
      </Container>
    </>
  );
};

export default DatabaseMobileScreen;
