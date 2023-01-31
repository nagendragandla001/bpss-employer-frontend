/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import React, {
  useEffect, useState, forwardRef, useImperativeHandle, useRef,
} from 'react';
import {
  Row, Col, Checkbox, Collapse, Radio, Space, Typography, Slider, InputNumber, Tag,
} from 'antd';
import { applicationStatusServiceAPI } from 'service/application-card-service';
import { pushClevertapEvent } from 'utils/clevertap';
import {
  applicationCreatedOnFilters, genderFilters, educationFilters, applicationStatusFilters,
  applicationStageFilters,
} from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

const { Panel } = Collapse;
const { Text } = Typography;

interface IFilters {
  gender: string;
  createdOn: string;
  maxAge: number;
  minAge: number;
  maxExperience: number;
  minExperience: number;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CommonFilters: React.FunctionComponent<any> = forwardRef(

  ({
    filterHandler, jobId, selectedFilters, selectedStage,
  }, ref) => {
    const [applicationsPerStage,
      setApplicationsPerStages] = useState<Array<{label:string, value:number}>>([]);
    const [currentStage, setCurrentStage] = useState('');
    const firstUpdate = useRef(true);
    // currentFilters used to store all the checkbox filter values
    const [currentFilters, setCurrentFilters] = useState<Array<string>>([]);
    const ageRangeMarks = { 0: '0', 70: '70' };
    const experienceRangeMarks = { 0: '0', 20: '20' };
    const [experienceSelected, setExperienceSelected] = useState('');
    const [tempAge, setTempAge] = useState([-1, -1]);
    const [tempExp, setTempExp] = useState([-1, -1]);
    const [newFilters, setNewFilters] = useState<IFilters>({
      gender: '',
      createdOn: '',
      maxAge: -1,
      minAge: -1,
      maxExperience: -1,
      minExperience: -1,
    });
    const [candidateDisabledVal, setCandidateDisabledVal] = useState({
      candidateUnlocked: false,
      candidateLocked: false,
    });

    const [disabledVal, setDisabledVal] = useState({
      applied: true,
      shortlisted: true,
      interview: true,
      selected: true,
      rejected: true,
    });
    const [mobileFilterActiveTab, setMobileFilterActiveTab] = useState({
      jobs: true,
      applicationStage: false,
      status: false,
      createdOn: false,
      education: false,
      gender: false,
      age: false,
      experience: false,
    });
    const applicationFilters = [
      {
        label: 'Walk-In',
        value: 'walk_in',
        disabled: disabledVal.applied,
      },
      {
        label: 'Interview Today',
        value: 'interviewToday',
        disabled: disabledVal.interview,
      },
      {
        label: 'Interview Tomorrow',
        value: 'interviewTomorrow',
        disabled: disabledVal.interview,
      },
      {
        label: 'Interview Done',
        value: 'interview_done',
        disabled: disabledVal.interview,
      },
      {
        label: 'Rejected Applications',
        value: 'rejected',
        disabled: disabledVal.selected || disabledVal.rejected,
      },
      {
        label: 'Joined',
        value: 'joined',
        disabled: disabledVal.selected || disabledVal.rejected,
      },
      {
        label: 'Offer Accepted',
        value: 'offer_accepted',
        disabled: disabledVal.selected || disabledVal.rejected,
      },
      {
        label: 'Offer Rejected',
        value: 'offer_rejected',
        disabled: disabledVal.selected || disabledVal.rejected,
      },
      {
        label: 'Left Job',
        value: 'left_job',
        disabled: disabledVal.selected || disabledVal.rejected,
      },
    ];
    const filterChangeHandler = (value): void => {
      let filters = [...value];

      // removing non-checkbox filters from filter argument
      filters = filters.filter(
        (val) => [...genderFilters, ...applicationCreatedOnFilters].indexOf(val) === -1,
      );
      filters = filters.filter(
        (val) => !(val.includes('age') || val.includes('experience')),
      );
      // setting the checkbox filter values
      setCurrentFilters([...filters]);

      // setting candidate locked/unlocked disablity
      setCandidateDisabledVal({
        candidateLocked: filters.includes('candidate_unlocked'),
        candidateUnlocked: filters.includes('candidate_locked'),
      });

      // adding non-checkbox filters to the filter list to be sent to parent filterHandler
      if (newFilters.gender) {
        filters = [...filters, newFilters.gender];
      }
      if (newFilters.createdOn) {
        filters = [...filters, newFilters.createdOn];
      }

      if (newFilters.maxAge !== -1 || newFilters.minAge !== -1) {
        filters = [...filters, `age_min_${newFilters.minAge !== -1 ? newFilters.minAge : 0}`, `age_max_${newFilters.maxAge !== -1 ? newFilters.maxAge : 100}`, 'age_filter'];
      }

      if (newFilters.maxExperience !== -1 || newFilters.minExperience !== -1) {
        filters = [
          ...filters,
          `experience_min_${newFilters.minExperience !== -1 ? newFilters.minExperience : 0}`,
          `experience_max_${newFilters.maxExperience !== -1 ? newFilters.maxExperience : 100}`, 'experience_filter',
        ];
      }

      if (selectedStage && selectedStage.length > 0) {
        selectedStage.map((st) => {
          filters.push(st);
          return null;
        });
      }
      filterHandler(filters.length ? filters : undefined);
      pushClevertapEvent('Filters', { Type: 'Generic', Value: `${value}` });
    };

    useImperativeHandle(ref, () => ({
      resetFilter():void {
        setDisabledVal((prevState) => ({
          ...prevState,
          applied: true,
          shortlisted: true,
          interview: true,
          selected: true,
          rejected: true,
        }));
        filterHandler(undefined);
        setCurrentFilters([]);
        setNewFilters((prev) => ({
          ...prev,
          gender: '',
          createdOn: '',
          minAge: -1,
          maxAge: -1,
          minExperience: -1,
          maxExperience: -1,
        }));
        setTempAge([-1, -1]);
        setTempExp([-1, -1]);
        setExperienceSelected('');
      },
      removeFilter(filter):void {
        let updatedFilters = [...selectedFilters, ...selectedStage].filter((val) => val !== filter);
        if (genderFilters.indexOf(filter) !== -1) {
          setNewFilters((prev) => ({
            ...prev,
            gender: '',
          }));
        }
        if (filter.includes('candidate')) {
          setCandidateDisabledVal({
            candidateLocked: false,
            candidateUnlocked: false,
          });
        }
        if (applicationCreatedOnFilters.indexOf(filter) !== -1) {
          setNewFilters((prev) => ({
            ...prev,
            createdOn: '',
          }));
        }
        if (filter.includes('age_filter')) {
          updatedFilters = selectedFilters.filter((val) => !val.includes('age'));
          setTempAge([-1, -1]);
          setNewFilters((prev) => ({
            ...prev,
            minAge: -1,
            maxAge: -1,
          }));
        }
        if (applicationStageFilters.includes(filter)) {
          setDisabledVal((prevState) => ({
            ...prevState,
            applied: true,
            shortlisted: true,
            interview: true,
            selected: true,
            rejected: true,
          }));
          setCurrentStage('');
          updatedFilters.filter((val) => !selectedStage.includes(val));
        }
        if (filter.includes('experience_filter')) {
          updatedFilters = selectedFilters.filter((val) => !val.includes('experience'));
          setTempExp([-1, -1]);
          setNewFilters((prev) => ({
            ...prev,
            minExperience: -1,
            maxExperience: -1,
          }));
          setExperienceSelected('');
        }
        setCurrentFilters(updatedFilters);
        filterHandler(updatedFilters);
      },
      removeStage():void {
        setDisabledVal((prevState) => ({
          ...prevState,
          applied: true,
          shortlisted: true,
          interview: true,
          selected: true,
          rejected: true,
        }));
        filterHandler(currentFilters);
      },
    }));

    const appStageChangeHandler = (value):void => {
      let currentSelectedStage = value;
      const filteredSelectedFilters = selectedFilters && selectedFilters.filter(
        (item) => ((['pre_skilled', 'public_resume', 'freeUnlock', 'candidate_unlocked', 'candidate_locked', ...educationFilters, ...genderFilters, ...applicationCreatedOnFilters].indexOf(item) !== -1) || (
          item.includes('age') || item.includes('experience')
        )),
      );
      if (value && value.length) {
        currentSelectedStage = value.filter((item) => (item !== selectedStage[0])
        && (item !== currentStage));
        setDisabledVal((prevState) => ({
          ...prevState,
          applied: currentSelectedStage[0] === 'Applied',
          shortlisted: currentSelectedStage[0] === 'Shortlisted',
          interview: currentSelectedStage[0] === 'Interview',
          selected: currentSelectedStage[0] === 'Selected',
          rejected: currentSelectedStage[0] === 'Rejected',
        }));
        setCurrentStage(currentSelectedStage[0]);
      } else {
        setDisabledVal((prevState) => ({
          ...prevState,
          applied: true,
          shortlisted: true,
          interview: true,
          selected: true,
          rejected: true,
        }));
      }
      currentSelectedStage = currentSelectedStage.concat(filteredSelectedFilters);
      filterHandler(currentSelectedStage);
      pushClevertapEvent('Filters', { Type: 'Application stage', Value: `${currentSelectedStage}` });
    };

    useEffect(() => {
      applicationStatusServiceAPI(jobId).then((response) => response?.data)
        .then((body) => {
          const data = body?.aggregations;
          const applicationsCount = [
            {
              label: 'Applied',
              value: data?.applied_cap?.doc_count + data?.applied_tbsi?.doc_count
              + data?.employer_shortlisted?.doc_count,
            },
            {
              label: 'Shortlisted',
              value: data?.employer_shortlisted.doc_count
              + data?.shortlisted?.doc_count,
            },
            {
              label: 'Interview',
              value: data?.interviewed?.doc_count,
            },
            {
              label: 'Selected',
              value: data?.selected?.doc_count,
            },
            {
              label: 'Rejected',
              value: data?.rejected?.doc_count,
            },
          ];
          setApplicationsPerStages(applicationsCount);
        });
    }, [jobId]);

    useEffect(() => {
      if (selectedStage && selectedStage.length) {
        setDisabledVal((prevState) => ({
          ...prevState,
          applied: selectedStage[0] === 'Applied',
          shortlisted: selectedStage[0] === 'Shortlisted',
          interview: selectedStage[0] === 'Interview',
          selected: selectedStage[0] === 'Selected',
          rejected: selectedStage[0] === 'Rejected',
        }));
      }
    }, [selectedStage]);

    useEffect(() => {
      // firstUpdate ref used to stop it from running on initial render
      if (firstUpdate.current) {
        firstUpdate.current = false;
        return;
      }
      filterChangeHandler(currentFilters);
    }, [newFilters]);

    return (
      <>
        <Row>
          <Col xs={{ span: 0 }} md={{ span: 24 }}>
            <Checkbox.Group onChange={filterChangeHandler} value={selectedFilters}>
              <Row>
                <Collapse className="full-width collapse-banner site-collapse-custom-collapse" expandIconPosition="end" defaultActiveKey={['1']}>
                  <Panel header={<Text strong>Profile</Text>} key="1" className="site-collapse-custom-panel">
                    <Row className="site-collapse-custom-panel">
                      <Col span={24} className="filter-checks">
                        <Checkbox value="pre_skilled">
                          <Space wrap>
                            <Text>Pre-skilled Candidates</Text>
                            <Tag className="success">New</Tag>
                          </Space>
                        </Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="public_resume">CV Available</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox
                          value="candidate_unlocked"
                          disabled={candidateDisabledVal.candidateUnlocked}
                        >
                          Candidate Contact Unlocked
                        </Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox
                          value="candidate_locked"
                          disabled={candidateDisabledVal.candidateLocked}
                        >
                          Candidate Contact Locked
                        </Checkbox>
                      </Col>
                    </Row>
                  </Panel>
                </Collapse>

                <Collapse className="full-width collapse-banner" expandIconPosition="end" defaultActiveKey={['1']}>
                  <Panel header={<Text strong>Application Stage</Text>} key="1">
                    <Col span={24} className="stages-filter-container">
                      <Checkbox.Group
                        onChange={appStageChangeHandler}
                        value={selectedStage}
                        className="checkbox-group"
                      >
                        {
                          applicationsPerStage && applicationsPerStage.map((stage) => (
                            <Checkbox
                              value={stage.label}
                              key={stage.label}
                              className="stage-container"
                            >
                              <Row className="stage-info">
                                <Col className="stage-value" span={24}>
                                  <Row justify="end">
                                    <Col>
                                      {stage.value}
                                    </Col>
                                  </Row>

                                </Col>
                                <Col className="stage-label" span={24}>
                                  {/* {stage.label === 'Selected' ? (
                                    <p style={{ textAlign: 'right', marginBottom: 0 }}>
                                      Selected/ Rejected
                                    </p>
                                  ) : stage.label} */}
                                  <Row justify="center">
                                    <Col>
                                      {stage.label}
                                    </Col>
                                  </Row>

                                </Col>
                              </Row>
                            </Checkbox>
                          ))
                        }
                      </Checkbox.Group>
                    </Col>
                  </Panel>
                </Collapse>
                {/* </Col> */}
                <Collapse className="full-width collapse-banner" expandIconPosition="end">
                  <Panel header={<Text strong>Status</Text>} key="2">
                    {
                      applicationFilters.map((stage) => (
                        <Col span={24} key={stage.value} className="filter-checks">
                          <Checkbox
                            value={stage.value}
                            disabled={!stage.disabled}
                          >
                            {stage.label}
                          </Checkbox>
                        </Col>
                      ))
                    }
                  </Panel>
                </Collapse>
                <Collapse className="full-width collapse-banner" expandIconPosition="end">
                  <Panel header={<Text strong>Education</Text>} key="1">
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
                  </Panel>
                </Collapse>
              </Row>
            </Checkbox.Group>
            <Collapse className="full-width collapse-banner" expandIconPosition="end">
              <Panel header={<Text strong>Age</Text>} key="3">
                <Row>
                  <Col span={24}>
                    <Row justify="space-between">
                      <InputNumber
                        size="small"
                        style={{
                          borderBottom: '2px solid grey', borderRadius: 5, width: 50,
                        }}
                        value={newFilters.minAge !== -1 ? newFilters.minAge : 0}
                        onChange={(val: number | null):void => {
                          setNewFilters((prev) => ({
                            ...prev,
                            minAge: val || -1,
                          }));
                          setTempAge([val || -1, tempAge[1]]);
                        }}
                        min={0}
                        max={newFilters.maxAge !== -1 ? newFilters.maxAge : 70}
                      />
                      <InputNumber
                        size="small"
                        style={{ borderBottom: '2px solid grey', borderRadius: 5, width: 50 }}
                        value={newFilters.maxAge !== -1 ? newFilters.maxAge : 70}
                        onChange={(val: number | null):void => {
                          setNewFilters((prev) => ({
                            ...prev,
                            maxAge: val || -1,
                          }));
                          setTempAge([tempAge[0], val || -1]);
                        }}
                        min={newFilters.minAge !== -1 ? newFilters.minAge : 0}
                        max={70}
                      />
                    </Row>
                  </Col>
                  <Col span={24}>
                    <Slider
                      range
                      min={0}
                      max={70}
                      marks={ageRangeMarks}
                      value={[
                        (tempAge[0] !== -1 ? tempAge[0] : 0),
                        (tempAge[1] !== -1 ? tempAge[1] : 70),
                      ]}
                      onChange={(val):void => {
                        setTempAge(val);
                      }}
                      onAfterChange={():void => {
                        setNewFilters((prev) => ({
                          ...prev,
                          minAge: tempAge[0],
                          maxAge: tempAge[1],
                        }));
                      }}
                    />
                  </Col>
                </Row>
              </Panel>
            </Collapse>
            <Collapse className="full-width collapse-banner" expandIconPosition="end">
              <Panel header={<Text strong>Experience</Text>} key="3">
                <Row gutter={[8, 16]}>
                  <Col span={24}>
                    <Radio.Group
                      className="full-width"
                      onChange={(e):void => {
                        const { value } = e.target;
                        setExperienceSelected(value);
                        if (value === 'Fresher') {
                          setNewFilters((prev) => ({
                            ...prev,
                            minExperience: 0,
                            maxExperience: 0,
                          }));
                        }
                      }}
                      value={experienceSelected}
                    >
                      <Radio value="Fresher">Fresher</Radio>
                      <Radio value="Experienced">Experienced</Radio>
                    </Radio.Group>
                  </Col>
                  {experienceSelected === 'Experienced' && (
                    <Col span={24}>
                      <Row gutter={[8, 8]}>
                        <Col span={24}>
                          <Row justify="space-between">
                            <InputNumber
                              size="small"
                              style={{
                                borderBottom: '2px solid grey', borderRadius: 5, width: 50,
                              }}
                              value={newFilters.minExperience !== -1 ? newFilters.minExperience : 0}
                              onChange={(val: number | null):void => {
                                setNewFilters((prev) => ({
                                  ...prev,
                                  minExperience: val || -1,
                                }));
                              }}
                              min={-1}
                              max={newFilters.maxExperience}
                            />
                            <InputNumber
                              size="small"
                              style={{ borderBottom: '2px solid grey', borderRadius: 5, width: 50 }}
                              value={
                                newFilters.maxExperience !== -1 ? newFilters.maxExperience : 20
                              }
                              onChange={(val: number | null):void => {
                                setNewFilters((prev) => ({
                                  ...prev,
                                  maxExperience: val || -1,
                                }));
                              }}
                              min={newFilters.minExperience}
                              max={70}
                            />
                          </Row>
                        </Col>

                        <Col span={24}>
                          <Slider
                            range
                            min={0}
                            max={20}
                            marks={experienceRangeMarks}
                            value={[
                              (tempExp[0] !== -1 ? tempExp[0] : 0),
                              (tempExp[1] !== -1 ? tempExp[1] : 20)]}
                            onChange={(val):void => {
                              setTempExp(val);
                            }}
                            onAfterChange={(val):void => {
                              setNewFilters((prev) => ({
                                ...prev,
                                minExperience: tempExp[0],
                                maxExperience: tempExp[1],
                              }));
                            }}
                          />
                        </Col>
                      </Row>
                    </Col>

                  )}
                </Row>

              </Panel>
            </Collapse>
            {/* </Row>
            </Checkbox.Group> */}

            <Radio.Group
              className="full-width"
              onChange={(e):void => {
                const gender:string = e.target.value;
                // setGenderFilter(gender);
                setNewFilters((prev) => ({
                  ...prev,
                  gender,
                }));
              }}
              // value={genderFilter}
              value={newFilters.gender}
            >
              <Collapse className="full-width collapse-banner" expandIconPosition="end">
                <Panel header={<Text strong>Gender</Text>} key="3">
                  <Row gutter={[8, 16]}>
                    <Col span={24}>
                      <Radio value="gender_male">Male</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="gender_female">Female</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="gender_all">All</Radio>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Radio.Group>
            <Radio.Group
              className="full-width collapse-banner"
              onChange={(e):void => {
                const createdOn:string = e.target.value;
                // setCreatedOnFilter(createdOn);
                setNewFilters((prev) => ({
                  ...prev,
                  createdOn,
                }));
              }}
              // value={createdOnFilter}
              value={newFilters.createdOn}
            >
              <Collapse className="full-width collapse-banner" expandIconPosition="end">
                <Panel header={<Text strong>Application Created On</Text>} key="3">
                  <Row gutter={[8, 16]}>
                    <Col>
                      <Radio value="created_today">Today</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_yesterday">Yesterday</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_last7days">Last 7 days</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_last14days">Last 14 days</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_last30days">Last 30 days</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_before30days">Before 30 days</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_all">All</Radio>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Radio.Group>
          </Col>

          {/* **************************************************************** */}
          {/* **************************************************************** */}
          {/* *********************** Mobile Filters  ************************ */}

          <Col xs={{ span: 24 }} md={{ span: 0 }}>
            <Row justify="space-between">
              <Col span={10} style={{ backgroundColor: '#fafbfb' }}>
                <Radio.Group
                  onChange={(e): void => {
                    setMobileFilterActiveTab(() => ({
                      jobs: false,
                      applicationStage: false,
                      status: false,
                      createdOn: false,
                      education: false,
                      gender: false,
                      age: false,
                      experience: false,
                      [e.target.value]: true,
                    }));
                  }}
                  style={{ height: '80vh', width: '100%' }}
                >
                  <Col span={24}>
                    <Radio.Button
                      type="text"
                      className="full-width mobile-filter-btn"
                      value="jobs"
                      checked
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Profile</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {selectedFilters.filter((val) => ['freeUnlock', 'public_resume', 'candidate_unlocked', 'candidate_locked'].includes(val)).length || null}
                          </Text>
                        </Col>
                      </Row>

                    </Radio.Button>
                  </Col>
                  <Col span={24}>
                    <Radio.Button
                      type="text"
                      className="full-width text-small mobile-filter-btn"
                      value="applicationStage"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Application Stage</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {applicationStageFilters.includes(selectedStage?.[0]) ? 1 : null}
                          </Text>
                        </Col>
                      </Row>
                    </Radio.Button>
                  </Col>
                  <Col span={24}>
                    <Radio.Button
                      type="text"
                      className="full-width text-small mobile-filter-btn"
                      value="status"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Status</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {selectedFilters.filter(
                              (val) => applicationStatusFilters.includes(val),
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
                      value="createdOn"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Created On</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {selectedFilters.filter(
                              (val) => (applicationCreatedOnFilters.includes(val) && !val.includes('all')),
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
                      value="education"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Education</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {selectedFilters.filter(
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
                      value="gender"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Gender</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {selectedFilters.filter(
                              (val) => (genderFilters.includes(val) && !val.includes('all')),
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
                            {selectedFilters.includes('age_filter') ? 1 : null}
                          </Text>
                        </Col>
                      </Row>
                    </Radio.Button>
                  </Col>
                  <Col span={24}>
                    <Radio.Button
                      type="text"
                      className="full-width text-small mobile-filter-btn"
                      value="experience"
                    >
                      <Row justify="space-between" style={{ width: 120 }}>
                        <Col>
                          <Text className="text-small">Experience</Text>
                        </Col>
                        <Col>
                          <Text className="text-small">
                            {selectedFilters.includes('experience_filter') ? 1 : null}
                          </Text>
                        </Col>
                      </Row>
                    </Radio.Button>
                  </Col>
                </Radio.Group>
              </Col>
              <Col span={12}>
                <Checkbox.Group onChange={filterChangeHandler} value={selectedFilters}>
                  <Row>
                    <Space className={mobileFilterActiveTab.jobs ? 'filter-visible' : 'filter-hidden'} style={{ paddingTop: 20 }}>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="pre_skilled">
                          <Space wrap>
                            <Text>Pre-skilled Candidates</Text>
                            <Tag className="success">New</Tag>
                          </Space>
                        </Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox value="public_resume">CV Available</Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox
                          value="candidate_unlocked"
                          disabled={candidateDisabledVal.candidateUnlocked}
                        >
                          Candidate Contact Unlocked
                        </Checkbox>
                      </Col>
                      <Col span={24} className="filter-checks">
                        <Checkbox
                          value="candidate_locked"
                          disabled={candidateDisabledVal.candidateLocked}
                        >
                          Candidate Contact Locked

                        </Checkbox>
                      </Col>
                    </Space>

                    <Col span={24} className={mobileFilterActiveTab.applicationStage ? 'filter-visible' : 'filter-hidden'}>
                      <Row className="stages-filter-label" />
                      <Row>
                        <Col span={24} className="stages-filter-container">
                          <Checkbox.Group
                            onChange={appStageChangeHandler}
                            value={selectedStage}
                            className="checkbox-group"
                          >
                            {
                              applicationsPerStage && applicationsPerStage.map((stage) => (
                                <Checkbox
                                  value={stage.label}
                                  key={stage.label}
                                  className="stage-container"
                                >
                                  <Row className="stage-info">
                                    <Col span={24} className="stage-value">{stage.value}</Col>
                                    <Col className="text-small stage-label">
                                      {stage.label}
                                    </Col>
                                  </Row>
                                </Checkbox>
                              ))
                            }
                          </Checkbox.Group>
                        </Col>
                      </Row>
                    </Col>

                    <Col span={24} className={mobileFilterActiveTab.status ? 'filter-visible' : 'filter-hidden'} style={{ paddingTop: 20 }}>
                      <Row>
                        {applicationFilters.map((stage) => (
                          <Col span={24} key={stage.value} className="filter-checks">
                            <Checkbox
                              value={stage.value}
                              disabled={!stage.disabled}
                            >
                              {stage.label}
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Col>

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

                    <Space className={mobileFilterActiveTab.age ? 'filter-visible' : 'filter-hidden'} style={{ paddingTop: 20 }}>
                      <Row gutter={[8, 16]}>
                        <Col span={20}>
                          <InputNumber
                            size="small"
                            style={{
                              borderBottom: '2px solid grey', borderRadius: 5, width: '100%',
                            }}
                            value={newFilters.minAge !== -1 ? newFilters.minAge : 0}
                            onChange={(val: number | null):void => {
                              setNewFilters((prev) => ({
                                ...prev,
                                minAge: val || -1,
                              }));
                            }}
                            min={-1}
                            max={newFilters.maxAge}
                          />
                        </Col>
                        <Col span={20}>
                          <InputNumber
                            size="small"
                            style={{ borderBottom: '2px solid grey', borderRadius: 5, width: '100%' }}
                            value={newFilters.maxAge !== -1 ? newFilters.maxAge : 70}
                            onChange={(val: number | null):void => {
                              setNewFilters((prev) => ({
                                ...prev,
                                maxAge: val || -1,
                              }));
                            }}
                            min={newFilters.minAge}
                            max={70}
                          />

                        </Col>
                      </Row>
                    </Space>

                  </Row>
                </Checkbox.Group>

                <Radio.Group
                  className={`full-width ${mobileFilterActiveTab.gender ? 'filter-visible' : 'filter-hidden'}`}
                  onChange={(e):void => {
                    const gender:string = e.target.value;
                    setNewFilters((prev) => ({
                      ...prev,
                      gender,
                    }));
                  }}
                  value={newFilters.gender}
                >
                  <Row gutter={[8, 16]}>
                    <Col span={24}>
                      <Radio value="gender_male">Male</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="gender_female">Female</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="gender_all">All</Radio>
                    </Col>
                  </Row>
                </Radio.Group>
                <Space className={mobileFilterActiveTab.experience ? 'filter-visible' : 'filter-hidden'} style={{ paddingTop: 20 }}>

                  <Row gutter={[8, 16]}>
                    <Col span={20}>
                      <Radio.Group
                        className="full-width "
                        onChange={(e):void => {
                          const { value } = e.target;
                          setExperienceSelected(value);
                          if (value === 'Fresher') {
                            setNewFilters((prev) => ({
                              ...prev,
                              minExperience: 0,
                              maxExperience: 0,
                            }));
                          }
                        }}
                        value={experienceSelected}
                      >
                        <Row gutter={[8, 16]}>
                          <Col span={24}>
                            <Radio value="Fresher">Fresher</Radio>
                          </Col>
                          <Col span={24}>
                            <Radio value="Experienced">Experienced</Radio>
                          </Col>

                        </Row>

                      </Radio.Group>
                    </Col>
                    {experienceSelected === 'Experienced' && (
                      <Col span={20}>
                        <Row gutter={[8, 16]}>
                          <Col span={20}>
                            <InputNumber
                              size="small"
                              style={{
                                borderBottom: '2px solid grey', borderRadius: 5, width: '100%',
                              }}
                              value={newFilters.minExperience !== -1 ? newFilters.minExperience : 0}
                              onChange={(val: number | null):void => {
                                setNewFilters((prev) => ({
                                  ...prev,
                                  minExperience: val || -1,
                                }));
                              }}
                              min={-1}
                              max={newFilters.maxExperience}
                            />
                          </Col>
                          <Col span={20}>
                            <InputNumber
                              size="small"
                              style={{
                                borderBottom: '2px solid grey', borderRadius: 5, width: '100%',
                              }}
                              value={
                                newFilters.maxExperience !== -1 ? newFilters.maxExperience : 20
                              }
                              onChange={(val: number | null):void => {
                                setNewFilters((prev) => ({
                                  ...prev,
                                  maxExperience: val || -1,
                                }));
                              }}
                              min={newFilters.minExperience}
                              max={20}
                            />
                          </Col>
                        </Row>
                      </Col>
                    )}
                  </Row>
                </Space>

                <Radio.Group
                  className={`full-width ${mobileFilterActiveTab.createdOn ? 'filter-visible' : 'filter-hidden'}`}
                  onChange={(e):void => {
                    const createdOn:string = e.target.value;
                    setNewFilters((prev) => ({
                      ...prev,
                      createdOn,
                    }));
                  }}
                  value={newFilters.createdOn}
                >
                  <Row gutter={[8, 16]}>
                    <Col span={24}>
                      <Radio value="created_today">Today</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_yesterday">Yesterday</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_last7days">Last 7 days</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_last14days">Last 14 days</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_last30days">Last 30 days</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_before30days">Before 30 days</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value="created_all">All</Radio>
                    </Col>
                  </Row>
                </Radio.Group>

              </Col>
            </Row>

          </Col>
        </Row>

      </>
    );
  },
);

export default CommonFilters;
