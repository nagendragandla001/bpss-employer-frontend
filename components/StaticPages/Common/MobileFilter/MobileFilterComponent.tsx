/* eslint-disable react/require-default-props */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import React, {
  useState, useEffect, useRef,
} from 'react';
import {
  Col, Modal, Button, Select, Row, Input, Spin, Badge, AutoComplete,
} from 'antd';
import CommonFilters from 'components/Candidates/CommonFilters';
import { allJobAPI, unlockContactAPI } from 'service/application-card-service';
import Loading3QuartersOutlined from '@ant-design/icons/Loading3QuartersOutlined';
import MobileApplicationCard from 'screens/authenticated/ApplicationsTab/Mobile/mobileApplicationCard';
import {
  ApplicationDataInterface,
  applicationStageFilters,
  getApplicationData,
  getSearchSpecificApplicaticationMobileData,
} from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import EmptyApplicationCard from 'screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyApplicationCard';
import usePersistedState from 'utils/usePersistedState';
import { pushClevertapEvent } from 'utils/clevertap';
import { ContextType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';
import CustomImage from 'components/Wrappers/CustomImage';
import snackBar from 'components/Notifications';
import dynamic from 'next/dynamic';

const MAddonExhaustedModal = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/MAddonExhausted'), { ssr: false });

require('components/StaticPages/Common/MobileFilter/MobileFilterComponent.less');

const { Option, OptGroup } = Select;

interface FilterProps{
  callback:(any) => void;
  callbackfilter:(any)=>void;
  filter: any;
  count?: number;
  context: ContextType;
  orgName: string;
}
interface StateInterface{
  applicationData: Array<ApplicationDataInterface>;
  totalApplications: number;
  loading: boolean,
  offset: number,
}
type jobsType={
  title: string,
  id: string,
}

const MobileFilterComponent: React.FunctionComponent <FilterProps> = (props:FilterProps) => {
  const {
    callback, callbackfilter, filter, count = 0, context, orgName,
  } = props;
  const [openJobs, setOpenJobs] = useState<Array<jobsType>>([]);
  const [pausedJobs, setPausedJobs] = useState<Array<jobsType>>([]);
  const [closedJobs, setClosedJobs] = useState<Array<jobsType>>([]);

  // State Variables
  const [visible, setVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [jobs, setJobs] = useState() as any;
  const [searchTerm, setSearchTerm] = useState() as any;
  const [enableModal, setEnableModal] = useState(false);
  const [recentList, setRecentList] = usePersistedState('recent_list', '');
  // SELECTED JOBID
  const [selectedJobID, setSelectedJobID] = useState('All Jobs');
  const [state, setState] = useState<StateInterface>({
    applicationData: [],
    totalApplications: 0,
    loading: false,
    offset: 0,
  });

  const handleJobsChange = (value):void => {
    callback(value);
    setSelectedJobID(value);
    let selectedjob = openJobs.filter((job) => job.id === value);

    if (selectedjob.length === 0) {
      selectedjob = closedJobs.filter((job) => job.id === value);
      if (selectedjob.length === 0) { selectedjob = pausedJobs.filter((job) => job.id === value); }
    }

    if (selectedjob !== undefined && selectedjob.length > 0) pushClevertapEvent('Filters', { Type: 'Jobs', Value: `${selectedjob[0].title}` });
  };

  const setApplicationData = async (): Promise<void> => {
    if (searchTerm) {
      const data = await getSearchSpecificApplicaticationMobileData(state.offset, 10, searchTerm);

      if (data.applicationData && data.applicationData.length) {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          applicationData: data.applicationData,
          totalApplications: data.applicationsCount,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          applicationData: data.applicationData,
          totalApplications: data.applicationsCount,
        }));
      }
    }
  };

  const getMoreApplicationData = async (): Promise<void> => {
    if (state.loading) return;
    if (state.applicationData.length < state.totalApplications) {
      // Only if more applications exits we will make an api call
      setState((prevState) => ({
        ...prevState,
        loading: true,
      }));
      const data = await getApplicationData(state.offset + 20, 20, 'recent_slots');
      if (data.applicationData.length) {
        const newApplicationData = [...state.applicationData, ...data.applicationData];
        setState((prevState) => ({
          ...prevState,
          applicationData: newApplicationData,
          totalApplications: data.applicationsCount,
          loading: false,
          offset: prevState.offset + 20,
        }));
      }
    }
  };

  const add = (arr, name): any[] => {
    const found = arr.some((el) => el.id === name.id);
    if (!found) arr.push(name);
    return arr;
  };

  const getOrgJobs = async (): Promise<void> => {
    const tempOpenJobs: Array<jobsType> = [];
    const tempPausedJobs: Array<jobsType> = [];
    const tempClosedJobs: Array<jobsType> = [];
    const apiCall = await allJobAPI();
    const response = await apiCall.data;
    if (response && response.objects && response.objects.length) {
      for (let i = 0; i < response.objects.length; i += 1) {
        if (response.objects[i]._source.state === 'J_O') {
          const obj = { id: response.objects[i]._id, title: response.objects[i]._source.title };
          add(tempOpenJobs, obj);
        } else if (response.objects[i]._source.state === 'J_P') {
          const obj = { id: response.objects[i]._id, title: response.objects[i]._source.title };
          add(tempPausedJobs, obj);
        } else if (response.objects[i]._source.state === 'J_C') {
          const obj = { id: response.objects[i]._id, title: response.objects[i]._source.title };
          add(tempClosedJobs, obj);
        }
      }
      setOpenJobs(tempOpenJobs);
      setPausedJobs(tempPausedJobs);
      setClosedJobs(tempClosedJobs);
    }
  };

  const handleClick = (): void => {
    setVisible(true);
  };
  const handleOk = (): void => {
    setVisible(false);
  };
  const handleCancel = (): void => {
    setVisible(false);
  };

  const onSearchClick = (): void => {
    setSearchVisible(true);
  };
  const onSearchCancel = (): void => {
    setState({
      applicationData: [],
      totalApplications: 0,
      loading: false,
      offset: 0,
    });
    setSearchTerm(undefined);
    setSearchVisible(false);
  };

  useEffect(() => {
    (async function allJobAPIFunc():Promise<void> {
      if (!jobs) {
        const response = await allJobAPI();
        setJobs(response?.data?.objects);
      }
    }());

    // if (!jobs) {
    //   allJobAPI().then((response) => response.data)
    //     .then((body) => {
    //       setJobs(body.objects);
    //     });
    // }
  }, [jobs]);

  useEffect(() => {
    if (searchTerm) {
      setApplicationData();
    }
  }, [searchTerm]);

  useEffect(() => {
    getOrgJobs();
  }, []);

  const childRef = useRef() as any;

  const handleClearAll = (): void => {
    childRef.current.resetFilter();
  };

  const renderTitle = (title: string): any => (
    <span className="recent-list-title">
      {title}
    </span>
  );

  const renderItem = (title: string): any => ({
    value: title,
    label: (
      <div className="recent-list-value" key={title}>
        <CustomImage
          src="/svgs/teal-search.svg"
          alt="search"
          width={24}
          height={24}
        />
        <span className="value">{title}</span>
      </div>
    ),
  });

  const handleOptions = (): any[] => {
    if (recentList !== '') {
      return recentList.map((item) => renderItem(item));
    }

    return [];
  };

  const options = handleOptions().length > 0 ? [
    {
      label: renderTitle('Recent Searches'),
      options: handleOptions(),
    },
  ] : [];

  const saveToPersistedList = (value): void => {
    if (recentList === '') {
      setRecentList([value]);
    } else if (!recentList.find((val) => val.toLowerCase() === value.toLowerCase())) {
      setRecentList([...recentList, value]);
    }
  };

  const handleSelect = (value): void => {
    setState((prevState) => ({
      ...prevState,
      offset: 0,
      loading: true,
    }));
    if (value === '') {
      setSearchTerm(undefined);
    } else {
      setSearchTerm(value);
    }
    pushClevertapEvent('Search', { Type: 'Text/Number', value });
  };

  const handleEnter = (e): void => {
    setState((prevState) => ({
      ...prevState,
      offset: 0,
      loading: true,
    }));
    if (e.currentTarget.value === '') {
      setSearchTerm(undefined);
    } else {
      saveToPersistedList(e.currentTarget.value);
      setSearchTerm(e.currentTarget.value);
    }
  };

  const showSnackbar = (description:string,
    iconName:string, notificationType: string) :void => {
    snackBar({
      title: '',
      description,
      iconName,
      notificationType,
      placement: 'topRight',
      duration: 5,
    });
  };

  const updateUnlockContactHandler = async (id): Promise<void> => {
    if (context.contactUnlocksLeft > 0) {
      const apiRespone = await unlockContactAPI(id);
      const response = await apiRespone.data;
      if ([200, 201, 202].includes(apiRespone.status)) {
        context.setcontactUnlocksLeft(
          context.contactUnlocksLeft - 1,
        );

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
      setEnableModal(true);
    }
  };

  const getFilters = (stageFilter):Array<string> => {
    if (!filter) return [];
    let stage:Array<string> = [];
    if (stageFilter) {
      stage = filter.filter(
        (item) => applicationStageFilters.indexOf(item) !== -1,
      );
    } else if (!stageFilter) {
      stage = filter.filter(
        (item) => applicationStageFilters.indexOf(item) === -1,
      );
    }
    return stage;
  };

  const updateDismissedCandidateHandler = (): void => {
    // console.log('MobileFilterComponent updateDismissedCandidateHandler');
  };

  return (
    <Row>
      <Col
        span={24}
        className="m-at-filter-container"
      >
        <Row gutter={0} align="middle" justify="space-between" className="sticky-inner">
          <Col span={17}>
            <Select
              className="m-at-filter-jobs"
              onChange={handleJobsChange}
              defaultValue=""
            >
              <Option value="" key="J_O">All Jobs</Option>
              {
                openJobs.length > 0 && openJobs.map((job) => (
                  <Option value={job.id} key={job.id} title={job.title}>{job.title}</Option>
                ))
              }
              <OptGroup label="Paused Jobs:">
                {
                  pausedJobs.length > 0 && pausedJobs.map((job) => (
                    <Option key={`passed-${job.id}`} value={job.id} title={job.title}>{job.title}</Option>
                  ))
                }
              </OptGroup>
              <OptGroup label="Closed Jobs:">
                {
                  closedJobs.length > 0 && closedJobs.map((job) => (
                    <Option key={`closed-${job.id}`} value={job.id} title={job.title}>{job.title}</Option>
                  ))
                }
              </OptGroup>
            </Select>
          </Col>
          <Col span={6}>
            <Row>
              <Col span={12}>
                {
                  (filter && filter.filter((val) => !['gender_all', 'created_all'].includes(val)).length > 0)
                    ? (
                      <Badge dot offset={[-7, 4]} color="#d83c3c" className="m-at-filter-badge">
                        <Button type="default" className="m-applied-filters" shape="circle" onClick={handleClick}>
                          <CustomImage
                            src="/images/application-tab/atfilter.svg"
                            alt="filter icon"
                            width={24}
                            height={24}
                          />
                        </Button>
                      </Badge>
                    )
                    : (
                      <Button type="link" onClick={handleClick}>
                        <CustomImage
                          src="/images/application-tab/atfilter.svg"
                          alt="filter icon"
                          width={24}
                          height={24}
                        />
                      </Button>
                    )
                }

              </Col>
              <Col span={12}>
                <Button type="link" onClick={onSearchClick}>
                  <CustomImage
                    src="/images/application-tab/ic-search.svg"
                    alt="search icon"
                    width={20}
                    height={20}
                  />
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Modal
          key="filters-modal"
          title={(
            <Row justify="space-between" key="filter-title">
              <Col>Filters</Col>
              <Col className="m-clear-all" onClick={handleClearAll}>
                Clear All
              </Col>
            </Row>
          )}
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          closable
          className="full-screen-modal m-at-filters-modal"
          mask={false}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              size="large"
              className="m-at-filter-submit"
            >
              Apply Filters
              <span className="count">
                (
                {count}
                {' '}
                results)
              </span>
            </Button>,
          ]}
          bodyStyle={{ padding: 0 }}
        >
          <CommonFilters
            filterHandler={callbackfilter}
            ref={childRef}
            jobId={selectedJobID !== 'All Jobs' ? selectedJobID : ''}
            selectedFilters={getFilters(false)}
            selectedStage={getFilters(true)}
          />
        </Modal>
      </Col>
      <Modal
        key="search-modal"
        title={
          [
            <CustomImage
              key="search-icon"
              src="/images/application-tab/ic-search.svg"
              width={20}
              height={20}
              alt="search icon"
              className="m-at-search-icon"
            />,
            <AutoComplete
              options={options}
              className="m-at-searchbar"
              dropdownClassName="recent-list"
              onSelect={handleSelect}
            >
              <Input
                key="search-input"
                placeholder="Search using name & phone no."
                className="m-at-searchbar"
                onPressEnter={handleEnter}
              />
            </AutoComplete>,

          ]
        }
        destroyOnClose
        visible={searchVisible}
        onCancel={onSearchCancel}
        closable
        closeIcon={<CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="search icon" className="m-at-search-icon" />}
        className="full-screen-modal m-at-search-modal"
        mask={false}
        footer={null}
      >
        {
          searchTerm && (
            state.applicationData.length > 0 ? (
              <>
                <Row className="at-mobile-background-charcoal-3">
                  <Col xs={{ span: 24 }} className="at-mobile-total-applications">
                    {`${state.totalApplications} Applications`}
                  </Col>
                </Row>
                <Row className="at-mobile-background-charcoal-3">
                  <Col xs={{ span: 24 }}>
                    <MobileApplicationCard
                      applications={state.applicationData}
                      getMoreApplicationData={getMoreApplicationData}
                      setApplicationData={setState}
                      selectedTab="applications"
                      updateDismissedCandidate={updateDismissedCandidateHandler}
                      updateUnlockContact={updateUnlockContactHandler}
                      orgName={orgName}
                    />
                    {state.loading
                      ? <Spin className="at-mobile-spinner" indicator={<Loading3QuartersOutlined style={{ fontSize: '2rem' }} spin />} />
                      : null}
                  </Col>
                </Row>
              </>
            ) : <EmptyApplicationCard />
          )
        }
      </Modal>
      {
        enableModal ? (
          <MAddonExhaustedModal
            visible
            title="Application Unlocks Exhausted"
            handleCancel={():void => { setEnableModal(false); }}
          />
        ) : null
      }
    </Row>
  );
};

export default MobileFilterComponent;
