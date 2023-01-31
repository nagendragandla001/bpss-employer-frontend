/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { useLazyQuery } from '@apollo/client';
import {
  Alert,
  Badge,
  Button, Checkbox, Col, Input, Pagination, Row, Space, Tooltip, Typography,
} from 'antd';
import EmptyApplicationSkeleton from 'components/Candidates/EmptyApplicationSkeleton';
import UnlockContext from 'components/Context/UnlockContext';
import Container from 'components/Layout/Container';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import AppConstants from 'constants/constants';
import debounce from 'lodash/debounce';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import {
  DatabaseTabInterface,
  flatDatabaseDataFunc,
} from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { CandidateFiltersType, ContextType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';
import { getGraphqlFiltes } from 'screens/authenticated/ApplicationsTab/Common/DatabaseTabUtils';
import AddonExhaustedModal from 'screens/authenticated/ApplicationsTab/Desktop/AddonExhausted';
import ApplicationCardDesktop from 'screens/authenticated/ApplicationsTab/Desktop/ApplicationCardDesktop';
import { findRecommendedCandidatesForEmployer } from 'screens/authenticated/ApplicationsTab/Desktop/recommendedApiQuery';
import {
  bulkUnlockContactAPI,
  downloadExcelDB,
  getDownloadList, getUnlockCandidatesInfo,
} from 'service/application-card-service';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Desktop/applicationsTabDesktop.less');

const { Text } = Typography;
const EmptyApplicationCard = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyApplicationCard'), { ssr: false });
const EmptyMessage = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyMessage'), { ssr: false });
const ForwardResumeModal = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/ForwardResume'), { ssr: false });
interface StateInterface {
  applicationData: Array<DatabaseTabInterface>;
  totalApplications: number;
  loading: boolean,
  offset: number,
  isEmpty?: boolean,
  downloadCount: number,
}

interface PropsType {
  selectedTab: string;
  databaseFilters: CandidateFiltersType;
  updateFilter: (obj) => void;
  orgId: string;
  context: ContextType;
  setDownloadsVisible: (boolean) => void;
  orgName: string;
}

const limit = 20;

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

const DatabaseTabDesktopScreen = (props: PropsType): JSX.Element => {
  const {
    selectedTab, databaseFilters, updateFilter, orgId, context, setDownloadsVisible, orgName,
  } = props;
  // const router = useRouter();
  const childRef = useRef() as any;

  // States
  const contactContext = useContext(UnlockContext);
  // const [clearfilter, setclearFilters] = useState(false);
  const [bulk, setBulk] = useState([]) as any;
  const [AllApp, setAllApp] = useState(false) as any;
  const [FRModalVisible, setFRModalVisible] = useState(false);
  // const [enableModal, setEnableModal] = useState(false);
  const [statecheck, setStateCheck] = useState(
    {
      indeterminate: false, // for discrete selection
      checkAll: false, // for all candidates in the current page
      allCandidates: false, // for all candidates in the current selection
    },
  ) as any;
  const [searchTerm, setSearchTerm] = useState() as any;
  const [addOnModal, setAddOnModal] = useState('');
  const [excelRequestInProgress, setExcelRequestInProgress] = useState(false);
  const [state, setState] = useState<StateInterface>({
    applicationData: [],
    isEmpty: false,
    loading: true,
    offset: 0,
    totalApplications: 0,
    downloadCount: 0,
  });
  // Download Options are as follows:
  // 'DISCRETE': for individual candidate download
  // 'PAGE',: for all the candidates in the current page
  //  'ALL': for all the candidates overall
  const [downloadOption, setDownloadOption] = useState('');

  const [fetchGraphqlData, {
    called, loading, error, data,
  }] = useLazyQuery(findRecommendedCandidatesForEmployer, {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  const setDatabaseData = async (): Promise<void> => {
    if ((searchTerm && !AllApp)) {
      fetchGraphqlData({
        variables: {
          job_id: databaseFilters.jobId,
          first: limit,
          query: searchTerm,
          after: 0,
          cmsSort: true,
          preSkilled: databaseFilters?.filter?.includes('pre_skilled'),
        },
      });
    } else if (((databaseFilters.filter && databaseFilters.filter.length > 0)
      || databaseFilters.jobId)
      && !AllApp) {
      fetchGraphqlData({
        variables: {
          job_id: databaseFilters.jobId,
          filter: getGraphqlFiltes(databaseFilters.filter, orgId),
          first: limit,
          after: state.offset,
          cmsSort: true,
          preSkilled: databaseFilters?.filter?.includes('pre_skilled'),
        },
      });
    } else if (AllApp) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
      }));
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

  const onPageChange = (page1: number): void => {
    window.scrollTo(0, 0);
    setBulk([]);
    childRef.current.bulkAction([]);
    setStateCheck({
      indeterminate: false,
      checkAll: false,
    });
    setAllApp(false);
    setState((prevState) => ({
      ...prevState,
      offset: page1 === 1 ? 0 : (page1 - 1) * limit,
    }));

    fetchGraphqlData({
      variables: {
        job_id: databaseFilters.jobId,
        filter: getGraphqlFiltes(databaseFilters.filter, orgId),
        first: page1 * limit < 50 ? limit : (page1 * limit) - 50,
        after: page1 === 1 ? 0 : (page1 - 1) * limit,
        cmsSort: true,
        preSkilled: databaseFilters?.filter?.includes('pre_skilled'),
      },
    });
  };

  const filterHandler = (): void => {
    setState((prevState) => ({
      ...prevState,
      offset: 0,
      loading: true,
    }));
    setStateCheck({
      indeterminate: false,
      checkAll: false,
    });
    setBulk([]);
    setSearchTerm('');
    // setUrlParams([]);
    setAllApp(false);
    setDatabaseData();
  };

  const handleBulk = (filterData): void => {
    if (!(filterData.includes('sharePoc') || filterData.includes('calenderInvite'))) {
      setBulk(filterData);
      setStateCheck({
        indeterminate: filterData.length > 0,
        checkAll: filterData.length === limit,
      });
    }
  };

  const getDownloadData = async ():Promise<void> => {
    const response = await getDownloadList(orgId, 0);
    setState((prevState) => ({
      ...prevState,
      downloadCount: response?.data?.meta?.count,
    }));
  };

  const downloadHandler = async (): Promise<void> => {
    setExcelRequestInProgress(true);
    // if (databaseFilters.filter || databaseFilters.jobId) {
    await downloadExcelDB(state.offset,
      limit,
      databaseFilters.filter,
      databaseFilters.jobId,
      downloadOption,
      'DB',
      bulk,
      orgId);

    // transformResponse(res);
    setTimeout(() => {
      setExcelRequestInProgress(false);
      getDownloadData();
    }, 5000);
    // } else {
    //   const res = await downloadExcelForAll(state.offset, 'recent_slots');

    //   transformResponse(res);
    //   setTimeout(() => {
    //     setExcelRequestInProgress(false);
    //   }, 5000);
    // }
    pushClevertapEvent('Excel Download', { Selected: 'Y' });
  };

  // const clearAllApp = (): void => {
  //   childRef.current.bulkAction([]);
  //   setBulk([]);
  //   setStateCheck({
  //     indeterminate: false,
  //     checkAll: false,
  //   });
  //   setAllApp(false);
  // };
  // const handleClevertap = ():void => {
  //   pushClevertapEvent('Forward Resume', { Type: 'Single/Bulk', Selected: 'N' });
  // };

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

  const bulkContactHandler = async (): Promise<void> => {
    const unlockedContacts = state.applicationData
      .filter((b) => bulk.includes(b.candidateId) && !b.candidateContactUnblocked);

    if (unlockedContacts.length > 0) {
      if (contactContext.databaseUnlocksLeft >= unlockedContacts.length) {
        const unlockContactIds = unlockedContacts
          .map((contact) => ({ candidate_id: contact.candidateId }));
        const apiRespone = await bulkUnlockContactAPI(unlockContactIds);
        const response = await apiRespone.data;

        if ([200, 201, 202].indexOf(apiRespone.status)) {
          if (response && response.length > 0) {
            contactContext.setdatabaseUnlocksLeft(
              contactContext.databaseUnlocksLeft - response.length,
            );
            const unlockedIds = response?.map((candidate) => (candidate.candidate));
            const map = new Map(response.map((a) => [a.candidate, a]));
            const result = data?.findRecommendedCandidatesForEmployer?.edges
              ?.map((o) => {
                if (unlockedIds.includes(o.id)) {
                  return { ...o, is_unlocked: true, ...map.get(o.id) as any };
                }
                return o;
              });
            data.findRecommendedCandidatesForEmployer.edges = result;

            const graphqldata = flatDatabaseDataFunc(data?.findRecommendedCandidatesForEmployer,
              databaseFilters);
            setState((prevState) => ({
              ...prevState,
              loading: false,
              applicationData: graphqldata.DatabaseData,
              totalApplications: graphqldata.applicationsCount,
              isEmpty: false,
            }));
            setBulk([]);
            childRef.current.bulkAction([]);
            setStateCheck({
              indeterminate: false,
              checkAll: false,
            });
            setAllApp(false);
            showSnackbar(`Total ${response?.length} locked contact${response?.data?.length > 1 ? 's' : ''} out of all ${bulk?.length} selected were unlocked`, 'congratsIcon.svg', 'info');
          } else {
            snackBar({
              title: 'Something went wrong!',
              description: '',
              iconName: '',
              notificationType: 'error',
              placement: 'topRight',
              duration: 5,
            });
          }
        } else if (apiRespone.response.status === 400
            && apiRespone.response.data.type === 'UnlockContactLimitReachedError') {
          setAddOnModal('insufficientCredits');
        }
      } else {
        setAddOnModal('creditsExaust');
      }
    } else {
      setBulk([]);
      childRef.current.bulkAction([]);
      setStateCheck({
        indeterminate: false,
        checkAll: false,
      });
      setAllApp(false);
    }
  };

  const handleSearchEvent = (searchInput): void => {
    setState((prevState) => ({
      ...prevState,
      offset: 0,
      loading: true,
    }));
    updateFilter({ filter: [] });
    setBulk([]);
    setStateCheck({
      indeterminate: false,
      checkAll: false,
    });
    pushClevertapEvent('Search', { Type: 'Text/Number', Keyword: `${searchInput}` });
  };

  const handleChange = (e): void => {
    const { value: nextValue } = e.target;
    setSearchTerm(nextValue);
    const debounceCall = debounce(() => handleSearchEvent(nextValue), 300);
    debounceCall();
  };

  const handleCheckAll = (e): void => {
    if (e.target.checked) {
      const allCandidates = state.applicationData.map((candidate) => candidate.candidateId);
      childRef.current.bulkAction(allCandidates);
      setBulk(allCandidates);
      setDownloadOption('PAGE');
      setStateCheck({
        indeterminate: false,
        checkAll: e.target.checked,
      });
    } else {
      childRef.current.bulkAction([]);
      setBulk([]);
      setDownloadOption('');
      setStateCheck({
        indeterminate: false,
        checkAll: false,
      });
      setAllApp(false);
    }
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

  const handleAllApplicationsDownload = (event): void => {
    if (event.target.checked) {
      setStateCheck((prevState) => ({
        ...prevState,
        allCandidates: true,
      }));
      setDownloadOption('ALL');
    } else {
      setStateCheck((prevState) => ({
        ...prevState,
        allCandidates: false,
      }));
      setDownloadOption('PAGE');
    }
  };

  const viewDonwloadsHandler = (): void => {
    setDownloadsVisible(true);
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

  useEffect(() => {
    if ((databaseFilters.jobId && databaseFilters.filter.length > 0)
      || (databaseFilters.jobId && databaseFilters.filter.length === 0)
      || (!databaseFilters.jobId && databaseFilters.filter.length > 0)) {
      filterHandler();
    } else {
      filterHandler();
    }
  }, [databaseFilters]);

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
    if (data) {
      if (data.findRecommendedCandidatesForEmployer
          && data.findRecommendedCandidatesForEmployer.edges.length > 0) {
        (async (): Promise<void> => {
          const unlockedContacts = data.findRecommendedCandidatesForEmployer.edges
            .filter((contact) => contact.is_unlocked).map((c) => ({ candidate_id: c.id }));

          const formattedCMSResult = data.findRecommendedCandidatesForEmployer.edges.map((edge) => {
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

          data.findRecommendedCandidatesForEmployer.edges = formattedCMSResult;

          if (unlockedContacts.length > 0) {
            const unlockData = await getUnlockCandidatesInfo(unlockedContacts);
            const response = await unlockData.data;
            const map = new Map(response.map((a) => [a.candidate, a]));
            const result = data.findRecommendedCandidatesForEmployer.edges
              .map((o) => ({ ...o, ...map.get(o.id) as any }));
            data.findRecommendedCandidatesForEmployer.edges = result;
          }
          const graphqldata = flatDatabaseDataFunc(data?.findRecommendedCandidatesForEmployer,
            databaseFilters);

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
    }

    if (loading) {
      setState((prevState) => ({
        ...prevState,
        loading: true,
      }));
    }
  }, [loading, data, error, called]);

  useEffect(() => {
    if (orgId) {
      getDownloadData();
    }
  }, [orgId]);

  const getDatabaseActions = (): JSX.Element => (
    <>
      <Row align="middle" gutter={8}>
        {excelRequestInProgress && (
          <Col span={24}>
            <Row align="middle" justify="space-between" className="download-helper-text">
              <Col>
                <Text>
                  Generating file. Download it from
                  {' '}
                  <Text strong>View Downloads</Text>
                  {' '}
                  page
                </Text>
              </Col>
            </Row>
          </Col>
        )}
        <Col>
          <Space>
            <Tooltip title="Select all Applications of current Page (except Reject)">
              <Checkbox
                className="at-desktop-bulk-checkbox"
                checked={statecheck.checkAll}
                indeterminate={statecheck.indeterminate}
                onChange={handleCheckAll}
                disabled={state.totalApplications <= 0}
              />
            </Tooltip>
            <Tooltip title="Bulk Unlock. Maximum limit for bulk unlock is 20 candidates.">
              <Button
                type="default"
                disabled={bulk.length === 0 || downloadOption === 'ALL'}
                className="forward-resume"
                onClick={bulkContactHandler}
                icon={(
                  <CustomImage
                    src="/images/application-tab/unlock-button.svg"
                    width={13}
                    height={13}
                    alt="Bulk Unlock"
                  />
                )}
              >
                {/* <Text strong className="text-small text">Bulk Unlock</Text> */}
              </Button>
            </Tooltip>
            <Tooltip
              // title={bulk && bulk.length > 0
              //   ? '' : 'Select applications and forward CV to your mail'}
              title="Select applications and forward CV to your mail. Maximum limit is 20 candidates."
              // trigger="click"
              className="at-desktop-popover"
            >
              <Button
                disabled={bulk.length === 0 || downloadOption === 'ALL'}
                onClick={(): void => {
                  setFRModalVisible(true);
                  pushClevertapEvent('Forward Resume');
                }}
                className="forward-resume"
              >
                <CustomImage
                  src="/images/application-tab/db-forward-resume.svg"
                  alt="mail icon"
                  width={13}
                  height={13}
                />
                {/* <Text strong className="text-small text">Forward Resume</Text> */}
              </Button>
            </Tooltip>
            <Input
              placeholder="Search using Name OR No."
              width="260px"
              className="dt-desktop-search"
              prefix={<SearchOutlined className="at-desktop-search-outline" />}
              onChange={handleChange}
              maxLength={50}
              allowClear
            />
          </Space>
        </Col>
        <Col className="text-right">
          {/* Download Excel Button */}
          <Button
            type="text"
            className={bulk.length === 0 ? 'at-disable-download-excel-btn' : 'at-download-excel-btn'}
            onClick={downloadHandler}
            loading={excelRequestInProgress}
            disabled={bulk?.length === 0}
          >
            <CustomImage
              src="/svgs/ic-excel.svg"
              alt="excel icon"
              className="margin-excel"
              height={24}
              width={24}
            />
            <span style={{ fontWeight: 'bold' }}> Download</span>
          </Button>
        </Col>
        {state.downloadCount > 0 && (
          <Col span={6}>
            <Button type="link" className="text-bold" onClick={viewDonwloadsHandler}>
              View Downloads
              {' '}
              <Badge count={state.downloadCount} offset={[5, 0]} size="small" />
            </Button>
          </Col>
        )}
      </Row>
      {(statecheck.checkAll && state?.totalApplications > limit) && (
        <Row
          align="middle"
          justify="center"
          style={{
            borderRadius: '4px',
            border: 'solid 1px #e3e4e6',
            backgroundColor: '#f9f9f9',
          }}
          gutter={16}
          // className="m-top-12"
          className="dt-desktop-bulk-actions-container"
        >
          <Col>
            <Text type="secondary" className="text-small">
              {`All ${bulk?.length} candidates in this page are selected`}
            </Text>
          </Col>
          <Col>
            <Checkbox
              className="at-desktop-bulk-checkbox"
              checked={statecheck.allCandidates}
              disabled={state.totalApplications <= 0}
              onChange={handleAllApplicationsDownload}
            />
            {' '}
            <Text strong className="text-small select-all-text">{`Select all ${(state?.totalApplications <= 50) ? state?.totalApplications : 50} candidates in the list`}</Text>
          </Col>

        </Row>
      )}
    </>
  );

  return (
    <>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Database | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Database | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      <Container>
        <Row className="at-desktop-container database-tab">
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={24} className="ct-desktop-bulk-actions-container-wrapper">
                {
                  getDatabaseActions()
                }
              </Col>
              {/* <Col span={24}>
                <Text>
                  All
                  {' '}
                  {`${bulk.length}`}
                  {' '}
                  candidates in this page are selected
                  <Text>

                    Select all
                    {' '}
                    {`${(state.totalApplications > 50 ? 50
                      : state.totalApplications) || 0}`}
                    {' '}
                    candidates in the list
                  </Text>
                </Text>
              </Col> */}
              {state.loading ? (
                <Col span={24}>
                  <EmptyApplicationSkeleton />
                </Col>
              ) : (
                <Col span={24}>
                  {
                    state.totalApplications > 0 ? (
                      <Row>
                        <Col span={24} className="m-b-16">
                          <Text className="text-disabled">Showing Candidates for: </Text>
                          <Text className="text-bold">{databaseFilters.jobTitle}</Text>
                        </Col>
                        <Col span={24}>
                          <ApplicationCardDesktop
                            selectedTab={selectedTab}
                            applications={state.applicationData}
                            setApplicationData={setState}
                            ref={childRef}
                            handleBulk={handleBulk}
                            jobId={databaseFilters?.jobId}
                            updateDismissedCandidate={updateDismissedCandidateHandler}
                            updateUnlockContact={updateUnlockContactHandler}
                            updateCandidateInfo={(): void => undefined}
                            updateDownloadOption={setDownloadOption}
                            orgName={orgName}
                          />
                        </Col>
                        {state.offset === 40 && (
                          <Col span={24}>
                            <Alert
                              message=""
                              description="For more recommendations, please shortlist or dismiss the given candidates."
                              type="warning"
                            />
                          </Col>
                        )}
                        <Col span={24}>
                          <Row align="middle" justify="center" className="ac-pagination">
                            <Col span={24}>
                              <Pagination
                                size="small"
                                current={state.offset / limit + 1}
                                total={(state.totalApplications > 50 ? 50
                                  : state.totalApplications) || 0}
                                defaultPageSize={limit}
                                showSizeChanger={false}
                                hideOnSinglePage
                                onChange={onPageChange}
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    ) : (
                      <Row>
                        {
                          state.isEmpty
                            ? <EmptyApplicationCard selectedTab={selectedTab} />
                            : <EmptyMessage selectedTab={selectedTab} />
                        }
                      </Row>
                    )
                  }
                </Col>
              ) }
            </Row>
          </Col>
        </Row>
        {FRModalVisible ? (
          <ForwardResumeModal
            visible={FRModalVisible}
            handleCancel={(): void => setFRModalVisible(false)}
            applicationId={bulk}
          />
        ) : null}
        {
          addOnModal !== '' ? (
            <AddonExhaustedModal
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

export default DatabaseTabDesktopScreen;
