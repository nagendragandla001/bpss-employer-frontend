/* eslint-disable react/require-default-props */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import Loading3QuartersOutlined from '@ant-design/icons/Loading3QuartersOutlined';
import { useLazyQuery } from '@apollo/client';
import {
  AutoComplete, Badge, Button, Checkbox, Col, Input, InputNumber, Modal,
  Radio,
  Row, Select, Space, Spin, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { useRouter } from 'next/router';
import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import EmptyApplicationCard from 'screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyApplicationCard';
import {
  DatabaseTabInterface,
  educationFilters,
  flatDatabaseDataFunc,
  genderFilters,
} from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { ContextType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';
import { getGraphqlFiltes, ModalTypes } from 'screens/authenticated/ApplicationsTab/Common/DatabaseTabUtils';
import { findRecommendedCandidatesForEmployer } from 'screens/authenticated/ApplicationsTab/Desktop/recommendedApiQuery';
import MAddonExhaustedModal from 'screens/authenticated/ApplicationsTab/Mobile/MAddonExhausted';
import MobileApplicationCard from 'screens/authenticated/ApplicationsTab/Mobile/mobileApplicationCard';
import { allJobAPI, bulkUnlockContactAPI, getUnlockCandidatesInfo } from 'service/application-card-service';
import { pushClevertapEvent } from 'utils/clevertap';
import usePersistedState from 'utils/usePersistedState';
import snackBar from 'components/Notifications';

require('components/StaticPages/Common/MobileFilter/MobileFilterComponent.less');

const { Option } = Select;
const { Paragraph, Text } = Typography;

type JobType={
  title: string,
  id: string,
}
interface FilterProps{
  callback:(any) => void;
  callbackfilter:(any)=>void;
  filter: any;
  count?: number;
  orgId: string;
  context: ContextType;
  orgName: string;
}
interface StateInterface{
  applicationData: Array<DatabaseTabInterface>;
  totalApplications: number;
  loading: boolean,
  offset: number,
}

const DatabaseFilterComponent: React.FunctionComponent <FilterProps> = (props:FilterProps) => {
  const {
    callback, callbackfilter, filter, count = 0, orgId, context, orgName,
  } = props;
  const router = useRouter();

  const [openJobs, setOpenJobs] = useState<Array<JobType>>([]);

  // State Variables
  const [visible, setVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [jobs, setJobs] = useState() as any;
  const [searchTerm, setSearchTerm] = useState() as any;
  const [addOnModal, setAddOnModal] = useState('');
  const [recentList, setRecentList] = usePersistedState('recent_list', '');
  const [candidateDisabledVal, setCandidateDisabledVal] = useState({
    candidateUnlocked: false,
    candidateLocked: false,
  });
  // SELECTED JOBID
  // const [selectedJobID, setSelectedJobID] = useState('All Jobs');
  const [selectedJob, setSelectedJob] = useState<JobType>({
    id: '',
    title: '',
  });
  const [mobileFilterActiveTab, setMobileFilterActiveTab] = useState({
    jobs: true,
    education: false,
    gender: false,
    age: false,
  });
  const [genderFilter, setGenderFilter] = useState('');
  const [currentFilters, setCurrentFilters] = useState<Array<string>>([]);
  const [maxAgeSelected, setMaxAgeSelected] = useState(-1);
  const [minAgeSelected, setMinAgeSelected] = useState(-1);
  const ageRangeMarks = { 0: '0', 70: '70' };

  const [state, setState] = useState<StateInterface>({
    applicationData: [],
    totalApplications: 0,
    loading: false,
    offset: 0,
  });

  const [fetchGraphqlData, {
    loading: recommendLoading,
    error,
    data: recommendData,
    // fetchMore: refetchData,
  }] = useLazyQuery(findRecommendedCandidatesForEmployer, {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  const handleJobsChange = (value):void => {
    // callback(value);
    // setSelectedJobID(value);

    const currentJob = openJobs.find((job) => job.id === value);
    setSelectedJob({
      id: value,
      title: currentJob ? currentJob.title : '',
    });
    callback({
      id: value,
      title: currentJob ? currentJob.title : '',
    });

    if (currentJob) {
      pushClevertapEvent('Filters', { Type: 'Jobs', Value: `${currentJob.title}` });
    }
  };

  const setDatabaseData = async (): Promise<void> => {
    if (searchTerm) {
      fetchGraphqlData({
        variables: {
          job_id: selectedJob.id,
          first: 10,
          query: searchTerm,
          after: state.offset,
          preSkilled: false,
        },
      });
    } else {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        applicationData: [],
        totalApplications: 0,
      }));
    }
  };

  const filterChangeHandler = (value): void => {
    let filters = [...value];
    filters = filters.filter((val) => genderFilters.indexOf(val) === -1);
    if (genderFilter) {
      filters = [...filters, genderFilter];
    }
    setCurrentFilters(filters);
    if (maxAgeSelected !== -1 || minAgeSelected !== -1) {
      filters = [...filters, `age_min_${minAgeSelected !== -1 ? minAgeSelected : 0}`, `age_max_${maxAgeSelected !== -1 ? maxAgeSelected : 100}`, 'age_filter'];
    }
    setCandidateDisabledVal({
      candidateLocked: filters.includes('unlockCandidate'),
      candidateUnlocked: filters.includes('lockCandidate'),
    });
    callbackfilter(filters.length ? filters : undefined);
    pushClevertapEvent('Filters', { Type: 'Generic', Value: `${value}` });
  };

  const getMoreApplicationData = async (): Promise<void> => {
    if (state.loading) return;
    // Only if more applications exits we will make an api call
    if (state.applicationData.length < state.totalApplications) {
      setState((prevState) => ({
        ...prevState,
        offset: prevState.offset + 10,
      }));

      fetchGraphqlData({
        variables: {
          job_id: selectedJob.id,
          filter: getGraphqlFiltes(filter, orgId),
          first: state.offset + 10,
          after: state.offset + 10,
          preSkilled: filter?.filter?.includes('pre_skilled'),
        },
      });
    }
  };

  const add = (arr, name): any[] => {
    const found = arr.some((el) => el.id === name.id);
    if (!found) arr.push(name);
    return arr;
  };

  const getOrgJobs = async (): Promise<void> => {
    const tempOpenJobs: Array<JobType> = [];

    const apiCall = await allJobAPI();
    const response = await apiCall.data;
    if (response && response.objects && response.objects.length) {
      for (let i = 0; i < response.objects.length; i += 1) {
        if (response.objects[i]._source.state === 'J_O') {
          const obj = { id: response.objects[i]._id, title: response.objects[i]._source.title };
          add(tempOpenJobs, obj);
        }
      }
      setOpenJobs(tempOpenJobs);

      if (router && router.query && router.query.filter) {
        const selectedParams = qs.parse(router.query.filter.toString(), { parseBooleans: true });
        if (selectedParams.job) {
          const jobObj = tempOpenJobs.find((job) => job.id === selectedParams.job);
          if (jobObj) {
            setSelectedJob({
              id: jobObj.id,
              title: jobObj.title,
            });
            callback({
              id: jobObj.id,
              title: jobObj.title,
            });
          }
        }
      } else {
        setSelectedJob({
          id: tempOpenJobs[0].id,
          title: tempOpenJobs[0].title,
        });
        callback({
          id: tempOpenJobs[0].id,
          title: tempOpenJobs[0].title,
        });
      }
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
    setSearchTerm('');
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
    setDatabaseData();
  }, [searchTerm]);

  useEffect(() => {
    getOrgJobs();
  }, []);

  useEffect(() => {
    filterChangeHandler(currentFilters);
  }, [genderFilter, minAgeSelected, maxAgeSelected]);

  useEffect(() => {
    if (error) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        applicationData: [],
        totalApplications: 0,
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
  }, [
    recommendData, error, recommendLoading]);

  const handleClearAll = (): void => {
    setCurrentFilters([]);
    setGenderFilter('');
    setMinAgeSelected(-1);
    setMaxAgeSelected(-1);
    setCandidateDisabledVal({
      candidateLocked: false,
      candidateUnlocked: false,
    });
    callbackfilter([]);
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

  const showSnackbar = (description:string,
    iconName:string, notificationType: string) :void => {
    snackBar({
      title: 'Location already exists!',
      description,
      iconName,
      notificationType: notificationType === 'success' ? 'success' : 'error',
      placement: 'topRight',
      duration: 5,
    });
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
    setSearchTerm(value);
    pushClevertapEvent('Search', { Type: 'Text/Number', value });
  };

  const handleEnter = (e): void => {
    setState((prevState) => ({
      ...prevState,
      offset: 0,
      loading: true,
    }));

    if (e.currentTarget.value === '') {
      setSearchTerm('');
    } else {
      saveToPersistedList(e.currentTarget.value);
      setSearchTerm(e.currentTarget.value);
    }
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
            'success');
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

  return (
    <Row>
      <Col
        span={24}
        className="m-at-filter-container"
      >
        <Row gutter={0} align="middle" justify="space-between" className="sticky-inner">
          <Col span={24} className="m-b-4">
            <Paragraph className="job-title">Showing Candidates for </Paragraph>
          </Col>
          <Col span={17}>
            <Select
              className="m-at-filter-jobs"
              onChange={handleJobsChange}
              defaultValue=""
              value={selectedJob.id}
            >
              {/* <Option value="" key="J_O">All Jobs</Option> */}
              {
                openJobs.length > 0 && openJobs.map((job) => (
                  <Option value={job.id} key={job.id} title={job.title}>{job.title}</Option>
                ))
              }
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
          title={
            [
              <Row justify="space-between" key="filter-title">
                <Col>Filters</Col>
                <Col onClick={handleClearAll} className="m-clear-all">Clear All</Col>
              </Row>,
            ]
          }
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
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
                {(count <= 50 ? count : 50)}
                {' '}
                results)
              </span>
            </Button>,
          ]}
          bodyStyle={{ padding: 0 }}
        >
          {/* <Col span={24} className="p-top-24">
            <Checkbox.Group value={filter} onChange={(values):void => { callbackfilter(values); }}>
              <Row>
                <Col span={24} className="filter-checks">
                  <Checkbox value="public_resume">CV Available</Checkbox>
                </Col>
                <Col span={24} className="filter-checks">
                  <Checkbox value="activeCandidate">Only Active candidate</Checkbox>
                </Col>
                <Col span={24} className="filter-checks">
                  <Checkbox value="unlockCandidate">Unlocked Candidate</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Col> */}

          {/* ******************MY MOBILE CHANGES***************** */}

          <Col xs={{ span: 24 }} md={{ span: 0 }}>
            <Row justify="space-between">
              <Col span={10} style={{ backgroundColor: '#fafbfb' }}>
                <Radio.Group
                  onChange={(e) => {
                    setMobileFilterActiveTab((prevState) => ({
                      jobs: false,
                      education: false,
                      gender: false,
                      age: false,
                      [e.target.value]: true,
                    }));
                  }}
                  style={{ height: '80vh', width: '100%' }}
                  className="full-width"
                >
                  <Col span={24}>
                    <Radio.Button
                      type="text"
                      className="full-width text-small mobile-filter-btn"
                      value="jobs"
                      checked
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Profile</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {filter?.filter((val) => ['activeCandidate', 'public_resume', 'unlockCandidate', 'lockCandidate'].includes(val)).length || null}
                          </Text>
                        </Col>
                      </Row>
                    </Radio.Button>
                  </Col>
                  <Col span={24}>
                    <Radio.Button
                      type="text"
                      className="full-width text-small mobile-filter-btn"
                      value="education"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Education</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {filter?.filter(
                              (val) => educationFilters.includes(val),
                            ).length || null}
                          </Text>
                        </Col>
                      </Row>

                    </Radio.Button>
                  </Col>
                  <Col span={24}>
                    <Radio.Button
                      type="text"
                      className="full-width text-small mobile-filter-btn"
                      value="age"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Age</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {filter?.includes('age_filter') ? 1 : null}
                          </Text>
                        </Col>
                      </Row>
                    </Radio.Button>
                  </Col>
                  <Col span={24}>
                    <Radio.Button
                      type="text"
                      className="full-width text-small mobile-filter-btn"
                      value="gender"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Gender</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {filter?.filter(
                              (val) => (genderFilters.includes(val) && !val.includes('all')),
                            ).length || null}
                          </Text>
                        </Col>
                      </Row>

                    </Radio.Button>
                  </Col>

                </Radio.Group>

              </Col>
              <Col span={13}>
                <Checkbox.Group onChange={filterChangeHandler} value={filter}>
                  {/* <Checkbox.Group> */}
                  <Row>
                    {/* <Collapse className="full-width collapse-banner" expandIconPosition="end">
                      <Panel header="Profile" key="1"> */}
                    <Space className={mobileFilterActiveTab.jobs ? 'filter-visible' : 'filter-hidden'} style={{ paddingTop: 20 }}>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="public_resume">CV Available</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox
                          value="unlockCandidate"
                          disabled={candidateDisabledVal.candidateUnlocked}
                        >
                          Unlocked Candidate
                        </Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox
                          value="lockCandidate"
                          disabled={candidateDisabledVal.candidateLocked}
                        >
                          Locked Candidate
                        </Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="activeCandidate">Only Active candidate</Checkbox>
                      </Col>
                    </Space>

                    {/* </Panel>

                    </Collapse> */}

                    {/* <Collapse className="full-width collapse-banner" expandIconPosition="end">
                      <Panel header="Education" key="1"> */}
                    <Space className={mobileFilterActiveTab.education ? 'filter-visible' : 'filter-hidden'} style={{ paddingTop: 20 }}>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="education_less_than_10th">Less than 10th</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="education_10th">10th</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="education_12th">12th</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="education_diploma">Diploma</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="education_graduate">Graduate</Checkbox>
                      </Col>
                    </Space>

                    {/* </Panel>
                    </Collapse> */}
                    {/* <Collapse className="full-width collapse-banner" expandIconPosition="end">
                      <Panel header="Age" key="3"> */}

                    <Space className={mobileFilterActiveTab.age ? 'filter-visible' : 'filter-hidden'} style={{ paddingTop: 20 }}>
                      {/* <Col span={24} className="filter-checks">
                        <Checkbox value="age<20">{'<20'}</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="age20-25">20-25</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="age25-30">25-30</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="age30-35">30-35</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="age35-40">35-40</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="age>40">{'>40'}</Checkbox>
                      </Col> */}
                      <Row gutter={[8, 16]}>
                        <Col span={20}>
                          <InputNumber
                            style={{
                              borderBottom: '2px solid grey', borderRadius: 5, width: '100%',
                            }}
                            size="small"
                            value={minAgeSelected !== -1 ? minAgeSelected : 0}
                            onChange={(val: number | null): void => {
                              setMinAgeSelected(val || -1);
                              // filterChangeHandler(currentFilters);
                            }}
                            min={-1}
                            max={maxAgeSelected}
                          />
                        </Col>
                        <Col span={20}>
                          <InputNumber
                            style={{
                              borderBottom: '2px solid grey', borderRadius: 5, width: '100%',
                            }}
                            size="small"
                            value={maxAgeSelected !== -1 ? maxAgeSelected : 70}
                            onChange={(val: number | null): void => {
                              setMaxAgeSelected(val || -1);
                              // filterChangeHandler(currentFilters);
                            }}
                            min={minAgeSelected}
                            max={70}
                          />

                        </Col>
                      </Row>
                    </Space>

                    {/* </Panel>
                    </Collapse> */}
                  </Row>
                </Checkbox.Group>

                {mobileFilterActiveTab.gender ? (
                  <Radio.Group
                    className="full-width"
                    onChange={(e) => {
                      const gender:string = e.target.value;
                      setGenderFilter(gender);
                    }}
                    value={genderFilter}
                  >
                    {/* <Collapse className="full-width collapse-banner" expandIconPosition="end">
                    <Panel header="Gender" key="3"> */}
                    <Space direction="vertical" style={{ paddingTop: 20 }}>
                      <Radio value="gender_male">Male</Radio>
                      <Radio value="gender_female">Female</Radio>
                      <Radio value="gender_all">All</Radio>
                    </Space>
                    {/* </Panel>
                  </Collapse> */}
                  </Radio.Group>
                ) : null}

              </Col>
            </Row>

          </Col>
        </Modal>
      </Col>
      <Modal
        key="search-modal"
        title={
          [
            <CustomImage key="search-icon" src="/images/application-tab/ic-search.svg" width={20} height={20} alt="search icon" className="m-at-search-icon" />,
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
        closeIcon={(
          <CustomImage
            src="/svgs/m-close.svg"
            width={24}
            height={24}
            alt="search icon"
            className="m-at-search-icon"
          />
        )}
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
                      updateDismissedCandidate={(): boolean => true}
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
        addOnModal !== '' ? (
          <MAddonExhaustedModal
            visible
            title={ModalTypes[addOnModal].title}
            description={ModalTypes[addOnModal].description}
            handleCancel={():void => { setAddOnModal(''); }}
          />
        ) : null
      }
    </Row>
  );
};

export default DatabaseFilterComponent;
