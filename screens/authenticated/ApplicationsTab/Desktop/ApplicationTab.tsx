/* eslint-disable no-lone-blocks */
/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConsoleSqlOutlined } from '@ant-design/icons';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import {
  Badge,
  Button, Checkbox, Col, Input, Pagination, Row, Select, Space, Spin, Tooltip, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import AppConstants from 'constants/constants';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import {
  ApplicationDataInterface,
  getAllApplicationData, getApplicationData,
  getFilterSpecificApplicaticationData, getSearchSpecificApplicaticationData,
} from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { CandidateFiltersType, ContextType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';
import AddonExhaustedModal from 'screens/authenticated/ApplicationsTab/Desktop/AddonExhausted';
import ApplicationCardDesktop from 'screens/authenticated/ApplicationsTab/Desktop/ApplicationCardDesktop';
import {
  applicationBulkUnlock, candidateInfo,
  downloadExcelForFilters,
  getDownloadList, unlockContactAPI,
} from 'service/application-card-service';
import { setUrlParams } from 'service/url-params-service';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Desktop/applicationsTabDesktop.less');

const EmptyApplicationCard = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyApplicationCard'), { ssr: false });
const EmptyMessage = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyMessage'), { ssr: false });
const ForwardResumeModal = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/ForwardResume'), { ssr: false });

const { Text } = Typography;
const { Option } = Select;

interface StateInterface {
  applicationData: Array<ApplicationDataInterface | any>;
  downloadCount: any;
  totalApplications: number;
  loading: boolean,
  offset: number,
  isEmpty?: boolean,
}

interface PropsType {
  selectedTab: string;
  applicationFilters: CandidateFiltersType;
  updateFilter: (obj) => void;
  context: ContextType;
  updatePage: (num) => void;
  pageNum:number;
  setDownloadsVisible: (boolean) => void;
  orgId: string;
  orgName: string;
}

const limit = 20;
const sortBy = 'recent_slots';

const ApplicationsTabDesktopScreen = (props:PropsType): JSX.Element => {
  const {
    selectedTab, applicationFilters, updateFilter, context, updatePage, setDownloadsVisible, orgId,
    pageNum, orgName,
  } = props;

  const childRef = useRef() as any;
  const allApplicationIds = [] as string[];
  // States
  const [bulk, setBulk] = useState([]) as any;
  const [AllApp, setAllApp] = useState(false) as any;
  const [FRModalVisible, setFRModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState() as any;
  const [statecheck, setStateCheck] = useState(
    {
      indeterminate: false, // for discrete selection
      checkAll: false, // for all candidates in the current page
      allCandidates: false, // for all candidates in the current selection
    },
  ) as any;

  // Download Options are as follows:
  // 'DISCRETE': for individual candidate download
  // 'PAGE',: for all the candidates in the current page
  //  'ALL': for all the candidates overall
  const [downloadOption, setDownloadOption] = useState('');

  const [excelRequestInProgress, setExcelRequestInProgress] = useState(false);
  const [enableModal, setEnableModal] = useState(false);
  const [state, setState] = useState<StateInterface>({
    applicationData: [],
    totalApplications: 0,
    downloadCount: 0,
    loading: true,
    offset: (pageNum - 1) * limit,
    isEmpty: false,
  });

  const onPageChange = (page1: number):void => {
    window.scrollTo(0, 0);
    setBulk([]);
    childRef.current.bulkAction([]);
    setAllApp(false);

    updatePage({
      page: page1,
    });
    setStateCheck({
      indeterminate: false,
      checkAll: false,
    });
  };

  const setApplicationData = async (): Promise<void> => {
    // const value = (pageNum - 1) * limit;
    if ((searchTerm && !AllApp)) {
      const data = await getSearchSpecificApplicaticationData(
        state.offset,
        limit,
        searchTerm,
        applicationFilters.filter,
        applicationFilters.jobId,
        sortBy,
      );
      updatePage({ page: state.offset / limit + 1 });
      if (data.applicationData) {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          applicationData: data.applicationData,
          totalApplications: data.applicationsCount,
          isEmpty: data.applicationsCount === 0,
        }));
      }
    } else if ((applicationFilters.filter || applicationFilters.jobId) && !AllApp) {
      if (applicationFilters.filter && !applicationFilters.jobId) {
        const params = applicationFilters.filter.map((f) => ({ [f]: true } as any));
      }
      if (applicationFilters.jobId
        && (!applicationFilters.filter
          || (applicationFilters.filter
            && applicationFilters.filter.length === 0))) {
        // setUrlParams([{ job: applicationFilters.jobId, page: pageNum }]);
      }
      if (applicationFilters.filter && applicationFilters.jobId) {
        const params = applicationFilters.filter.map((f) => ({ [f]: true } as any));
        params.push({ job: applicationFilters.jobId });
        params.push({ page: pageNum });
      }
      const data = await getFilterSpecificApplicaticationData(state.offset,
        limit,
        applicationFilters.filter,
        applicationFilters.jobId, sortBy);
      if (data.applicationData) {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          applicationData: data.applicationData,
          totalApplications: data.applicationsCount,
          isEmpty: data.applicationsCount === 0,
        }));
      }
      // updatePage({ page: state.offset / limit + 1 });
    } else if (AllApp) {
      let data;
      if (searchTerm) {
        data = await getSearchSpecificApplicaticationData(
          state.offset,
          state.totalApplications,
          searchTerm,
          applicationFilters.filter,
          applicationFilters.jobId,
          sortBy,
        );
      } else if (applicationFilters.filter || applicationFilters.jobId) {
        data = await getFilterSpecificApplicaticationData(state.offset,
          state.totalApplications,
          applicationFilters.filter,
          applicationFilters.jobId,
          sortBy);
      } else {
        data = await getAllApplicationData(0, state.totalApplications, sortBy);
      }
      updatePage({ page: state.offset / limit + 1 });
      if (data.applicationData && data.applicationData.length) {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          isEmpty: false,
        }));

        data.applicationData.map((app) => {
          if (app.applicationStage !== 'RJ' && app.applicationStage !== 'NI') {
            allApplicationIds.push(app.applicationId);
          }
          return allApplicationIds;
        });

        childRef.current.bulkAction(allApplicationIds);
        setBulk(allApplicationIds);
        setAllApp(true);
      }
    } else {
      const data = await getApplicationData(state.offset, limit, sortBy);
      if (data.applicationData && data.applicationData.length) {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          applicationData: data.applicationData,
          totalApplications: data.applicationsCount,
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
    }
  };

  const filterHandler = () :void => {
    setBulk([]);
    setAllApp(false);
    setState((prevState) => ({
      ...prevState,
      // offset: 0,
      loading: true,
    }));
    setApplicationData();
  };

  const handleBulk = (data):void => {
    if (!(data.includes('sharePoc') || data.includes('calenderInvite'))) {
      setBulk(data);
      setStateCheck({
        indeterminate: data.length > 0,
        checkAll: data.length === limit,
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

  const downloadHandler = async ():Promise<void> => {
    setExcelRequestInProgress(true);
    // if (applicationFilters.filter || applicationFilters.jobId) {
    if (downloadOption !== 'ALL') {
      await downloadExcelForFilters(state.offset,
        limit,
        applicationFilters.filter,
        applicationFilters.jobId,
        sortBy,
        downloadOption,
        'AP',
        bulk);
    } else {
      await downloadExcelForFilters(state.offset,
        limit,
        applicationFilters.filter,
        applicationFilters.jobId,
        sortBy,
        downloadOption,
        'AP');
    }

    // transformResponse(res);
    setTimeout(() => {
      setExcelRequestInProgress(false);
      getDownloadData();
    }, 5000);
    // }
    // else {
    //   const res = await downloadExcelForAll(state.offset, sortBy);
    //   // transformResponse(res);
    //   setTimeout(() => {
    //     setExcelRequestInProgress(false);
    //   }, 5000);
    // }

    pushClevertapEvent('Excel Download', { Selected: 'Y' });
  };

  // const handleAllApp = ():void => {
  //   setAllApp(true);
  //   updateFilter({ jobId: '', filter: [] });
  //   setState((prevState) => ({
  //     ...prevState,
  //     offset: 0,
  //     loading: true,
  //   }));
  // };

  const handleBulkChangeEvent = (event): void => {
    if (event.target.checked) {
      const applicationArr = state.applicationData
        .map((app) => app.applicationId);
      childRef.current.bulkAction(applicationArr);
      setBulk(applicationArr);
      setStateCheck({
        indeterminate: false,
        checkAll: event.target.checked,
      });
      setDownloadOption('PAGE');
    } else {
      childRef.current.bulkAction([]);
      setBulk([]);
      setStateCheck({
        indeterminate: false,
        checkAll: false,
      });
      setAllApp(false);
      setDownloadOption('');
    }
  };

  const handleSearchEvent = (e): void => {
    setState((prevState) => ({
      ...prevState,
      // offset: 0,
      loading: true,
    }));
    updatePage({ page: 1 });
    updateFilter({ jobId: '', filter: [] });
    setBulk([]);
    if (e.target.value === '') {
      setSearchTerm(undefined);
    } else {
      setSearchTerm(e.target.value);
    }
    pushClevertapEvent('Search', { Type: 'Text/Number', Keyword: `${e.target.value}` });
  };

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

  const updateCandidateInfoHandler = async (id: string): Promise<void> => {
    const candidateApiCall = await candidateInfo(id);
    setState((prevState) => ({
      ...prevState,
      applicationData: [...prevState.applicationData].map((app) => {
        if (app.applicationId === id) {
          return {
            ...app,
            ...candidateApiCall,
          };
        }
        return app;
      }),
    }));
  };

  const bulkContactHandler = async () => {
    const freeUnlocks = bulk.filter((bulkId) => {
      const currentCandidate = state.applicationData.find((app) => app.applicationId === bulkId);
      if (currentCandidate?.applicationCreatedDate) {
        const appCreatedDate = dayjs(currentCandidate.applicationCreatedDate);
        const currentDate = dayjs(new Date());
        const dateTillFree = appCreatedDate.add(24, 'h');

        const diff = dayjs(dateTillFree).diff(currentDate, 'm');
        const diffh = dayjs(dateTillFree).diff(currentDate, 'h');
        return (diffh <= 24 && diff > 0);
      }
      return false;
    });
    const postObj = bulk.map((bulkId) => ({ application_id: bulkId }));
    const response = await applicationBulkUnlock(postObj);
    if ([200, 201, 202].includes(response.status)) {
      context.setcontactUnlocksLeft(
        context.contactUnlocksLeft - (response?.data?.length - freeUnlocks.length),
      );
      const unlockedIds = response?.data?.map((appData) => (appData.application));
      setState((prevState) => ({
        ...prevState,
        applicationData: [...prevState.applicationData].map((app) => {
          if (unlockedIds.includes(app.applicationId)) {
            return {
              ...app,
              candidateContactUnblocked: true,
              candidateMobileNo: response?.unlocked_user?.mobile,
              candidateEmail: response?.unlocked_user?.email,
            };
          }
          return app;
        }),
      }));
      showSnackbar(`Total ${response?.data?.length} locked contact${response?.data?.length > 1 ? 's' : ''} out of all ${bulk?.length} selected were unlocked`, 'congratsIcon.svg', 'info');
    } else if (response.response.status === 400 && response.response.data.type === 'UnlockContactLimitReachedError') {
      setEnableModal(true);
    }
  };

  const updateUnlockContactHandler = async (id): Promise<void> => {
    if (context.contactUnlocksLeft > 0) {
      const apiRespone = await unlockContactAPI(id);
      const response = await apiRespone.data;
      if ([200, 201, 202].includes(apiRespone.status)) {
        const currentCandidate = state.applicationData.find((app) => app.applicationId === id);
        if (currentCandidate && currentCandidate.applicationCreatedDate) {
          const appCreatedDate = dayjs(currentCandidate.applicationCreatedDate);
          const currentDate = dayjs(new Date());
          const dateTillFree = appCreatedDate.add(24, 'h');

          const diff = dayjs(dateTillFree).diff(currentDate, 'm');
          const diffh = dayjs(dateTillFree).diff(currentDate, 'h');
          if (!(diffh <= 24 && diff > 0)) {
            context.setcontactUnlocksLeft(
              context.contactUnlocksLeft - 1,
            );
          }
        }
        setState((prevState) => ({
          ...prevState,
          applicationData: [...prevState.applicationData].map((app) => {
            if (app.applicationId === id) {
              return {
                ...app,
                candidateContactUnblocked: true,
                candidateMobileNo: response?.unlocked_user?.mobile,
                candidateEmail: response?.unlocked_user?.email,
              };
            }
            return app;
          }),
        }));

        showSnackbar('Contact Unlocked', 'congratsIcon.svg', 'info');
      } else if (apiRespone.response.status === 400 && apiRespone.response.data.type === 'UnlockContactLimitReachedError') {
        setEnableModal(true);
      }
    } else {
      const currentCandidate = state.applicationData.find((app) => app.applicationId === id);
      if (currentCandidate && currentCandidate.applicationCreatedDate) {
        const appCreatedDate = dayjs(currentCandidate.applicationCreatedDate);
        const currentDate = dayjs(new Date());
        const dateTillFree = appCreatedDate.add(24, 'h');
        const diff = dayjs(dateTillFree).diff(currentDate, 'm');
        const diffh = dayjs(dateTillFree).diff(currentDate, 'h');
        if (!(diffh <= 24 && diff > 0)) {
          setEnableModal(true);
        } else {
          const apiRespone = await unlockContactAPI(id);
          const response = await apiRespone.data;
          if ([200, 201, 202].includes(apiRespone.status)) {
            setState((prevState) => ({
              ...prevState,
              applicationData: [...prevState.applicationData].map((app) => {
                if (app.applicationId === id) {
                  return {
                    ...app,
                    candidateContactUnblocked: true,
                    candidateMobileNo: response?.unlocked_user?.mobile,
                    candidateEmail: response?.unlocked_user?.email,
                  };
                }
                return app;
              }),
            }));
            showSnackbar('Contact Unlocked', 'congratsIcon.svg', 'info');
          } else if (apiRespone.response?.status === 400 && apiRespone.response?.data?.type === 'UnlockContactLimitReachedError') {
            setEnableModal(true);
          }
        }
      }
    }
    updateCandidateInfoHandler(id);
  };

  const handleCheckAll = (e):void => {
    setStateCheck({
      indeterminate: false,
      checkAll: e.target.checked,
    });
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

  useMemo(() => {
    setState((prevState) => ({
      ...prevState,
      offset: (pageNum - 1) * limit,
    }));
  }, [pageNum]);

  useMemo(() => {
    if (!state.loading) {
      setState((prevState) => ({
        ...prevState,
        offset: 0,
        loading: true,
      }));
      setApplicationData();
    }
  }, [sortBy]);

  useEffect(() => {
    if ((applicationFilters.jobId && applicationFilters.filter.length > 0)
    || (applicationFilters.jobId && applicationFilters.filter.length === 0)
    || (!applicationFilters.jobId && applicationFilters.filter.length > 0)) {
      filterHandler();
    } else {
      filterHandler();
    }
    setStateCheck({
      indeterminate: false,
      checkAll: false,
    });
  }, [applicationFilters.jobId, applicationFilters.filter, pageNum]);

  useEffect(() => {
    if (orgId) {
      getDownloadData();
    }
  }, [orgId]);

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
        <Row className="at-desktop-container" justify="space-between">
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
          <Col span={24} className="ct-desktop-bulk-actions-container-wrapper">
            <Space className="at-desktop-bulk-actions-container">
              <Checkbox
                className="at-desktop-bulk-checkbox"
                checked={statecheck.checkAll}
                indeterminate={statecheck.indeterminate}
                onChange={handleBulkChangeEvent}
                disabled={state.totalApplications <= 0}
              />
              <Tooltip title="Bulk Unlock. Maximum limit for bulk unlock is 20 candidates.">
                <Button
                  type="default"
                  disabled={(bulk.length === 0 || downloadOption === 'ALL')}
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
                />
              </Tooltip>
              <Tooltip
                title="Select applications and forward CV to your mail. Maximum limit is 20 candidates."
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
                </Button>
              </Tooltip>
              <Input
                placeholder="Search using Name OR No."
                width="260px"
                className="at-desktop-search"
                prefix={<SearchOutlined className="at-desktop-search-outline" />}
                onChange={handleSearchEvent}
                maxLength={50}
                allowClear
              />
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
                  height={24}
                  width={24}
                />
                <Text strong>Download</Text>
              </Button>
              {state.downloadCount > 0 && (
                <Button type="link" className="text-bold" onClick={viewDonwloadsHandler}>
                  View Downloads
                  {' '}
                  <Badge count={state.downloadCount} offset={[5, 0]} size="small" />
                </Button>
              )}
            </Space>

            {(statecheck.checkAll && state?.totalApplications > limit) && (
              <Row
                align="middle"
                justify="center"
                style={{
                  borderRadius: '4px',
                  border: 'solid 1px #e3e4e6',
                  backgroundColor: '#f9f9f9',
                }}
                gutter={[16, 16]}
                className="at-desktop-bulk-actions-container"
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
                  <Text strong className="text-small select-all-text">{`Select all ${state?.totalApplications} candidates in the list`}</Text>
                </Col>

              </Row>
            )}

            {state.loading ? (
              <Col className="at-desktop-spinner">
                <Spin className="at-desktop-spinner" />
              </Col>
            ) : (
              <>
                <Row>
                  <Col span={24}>
                    {state.totalApplications > 0
                      ? (
                        <ApplicationCardDesktop
                          selectedTab={selectedTab}
                          applications={state.applicationData}
                          setApplicationData={setState}
                          ref={childRef}
                          handleBulk={handleBulk}
                          jobId={applicationFilters?.jobId}
                          updateDismissedCandidate={(): void => undefined}
                          updateUnlockContact={updateUnlockContactHandler}
                          updateCandidateInfo={updateCandidateInfoHandler}
                          updateDownloadOption={setDownloadOption}
                          orgName={orgName}
                        />
                      )
                      : state.isEmpty ? <EmptyApplicationCard selectedTab={selectedTab} />
                        : <EmptyMessage selectedTab={selectedTab} />}
                  </Col>
                </Row>
                <Row align="middle" justify="center" className="ac-pagination">
                  <Col span={24}>
                    <Pagination
                      size="small"
                      current={pageNum}
                      total={state.totalApplications || 0}
                      defaultPageSize={limit}
                      showSizeChanger={false}
                      hideOnSinglePage
                      onChange={onPageChange}
                    />
                  </Col>
                </Row>
              </>
            )}
          </Col>

        </Row>
        {FRModalVisible ? (
          <>
            <ForwardResumeModal
              visible={FRModalVisible}
              handleCancel={():void => setFRModalVisible(false)}
              applicationId={bulk}
            />
          </>
        ) : null}

        { enableModal
          ? (
            <AddonExhaustedModal
              visible
              title="Application Unlocks Exhausted"
              description="Upgrade your plan, or buy add ons to get more unlock credits"
              // action="getMoreCredits"
              handleCancel={():void => { setEnableModal(false); }}
            />
          ) : null}

      </Container>
    </>
  );
};

export default ApplicationsTabDesktopScreen;
