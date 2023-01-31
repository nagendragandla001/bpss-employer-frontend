/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import {
  Row, Col, Select, Button, Checkbox, Collapse, Radio, Typography, Tag, Slider, InputNumber, Space,
} from 'antd';
import { useRouter } from 'next/router';
import qs from 'query-string';
import { allJobAPI } from 'service/application-card-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { isMobile } from 'mobile-device-detect';
import { selectedFiltersDict, genderFilters } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

require('components/Candidates/ApplicationsFilters.less');

const { Panel } = Collapse;

const { Option } = Select;

const { Text } = Typography;
interface FilterProps {
  jobFilterHandler:(any) => void;
  filterHandler:(any)=>void;
  clear:boolean;
  // jobId: string;
}

type jobsType = {
  title: string,
  id: string,
}

const DatabaseFiltersComponent: React.FunctionComponent <FilterProps> = (props:FilterProps) => {
  const {
    jobFilterHandler, filterHandler, clear,
  } = props;
  const router = useRouter();
  const firstUpdate = useRef(true);
  const [selectedJobID, setSelectedJobID] = useState('');
  const [openJobs, setOpenJobs] = useState<Array<jobsType>>([]);
  const [selectedFilters, setSelectedFilters] = useState<Array<string>>([]);
  const [genderFilter, setGenderFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [currentFilters, setCurrentFilters] = useState<Array<string>>([]);
  const [maxAgeSelected, setMaxAgeSelected] = useState(-1);
  const [minAgeSelected, setMinAgeSelected] = useState(-1);
  const [maxExperienceSelected, setMaxExperienceSelected] = useState(-1);
  const [minExperienceSelected, setMinExperienceSelected] = useState(-1);
  const [experienceSelected, setExperienceSelected] = useState('');
  const ageRangeMarks = { 0: '0', 70: '70' };
  const [candidateDisabledVal, setCandidateDisabledVal] = useState({
    candidateUnlocked: false,
    candidateLocked: false,
  });
  const experienceRangeMarks = { 0: '0', 20: '20' };

  const add = (arr, name): any[] => {
    const found = arr.some((el) => el.id === name.id);
    if (!found) arr.push(name);
    return arr;
  };

  useEffect(() => {
    const getOrgJobs = async (): Promise<void> => {
      const tempOpenJobs: Array<jobsType> = [];

      const apiCall = await allJobAPI();
      const response = await apiCall.data;

      if (response && response.objects && response.objects.length) {
        for (let i = 0; i < response.objects.length; i += 1) {
          if (response.objects[i]._source.state === 'J_O') {
            const obj = { id: response.objects[i]._id, title: response.objects[i]._source?.title };
            add(tempOpenJobs, obj);
          }
        }

        if (tempOpenJobs.length > 0) {
          setOpenJobs(tempOpenJobs);

          if (router && router.query && router.query.filter) {
            const selectedParams = qs.parse(router.query.filter.toString(),
              { parseBooleans: true });
            if (selectedParams.job) {
              const selectedJob = tempOpenJobs.find((job) => job.id === selectedParams.job);
              if (selectedJob) {
                setSelectedJobID(selectedJob.id);
                jobFilterHandler({ id: selectedJob.id, title: selectedJob.title });
              }
            } else {
              setSelectedJobID(tempOpenJobs[0].id);
              jobFilterHandler({
                id: tempOpenJobs[0].id,
                title: tempOpenJobs[0].title,
              });
            }
          } else {
            setSelectedJobID(tempOpenJobs[0].id);
            jobFilterHandler({
              id: tempOpenJobs[0].id,
              title: tempOpenJobs[0].title,
            });
          }
        }
      }
    };

    getOrgJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jobFliterOnChange = (value):void => {
    setSelectedJobID(value);
    const selectedjob = openJobs.find((job) => job.id === value);
    if (selectedjob) {
      jobFilterHandler({ id: selectedjob.id, title: selectedjob.title });
      pushClevertapEvent('Filters', { Type: 'Jobs', Value: `${selectedjob.title}` });
    }
  };

  const clearAll = ():void => {
    pushClevertapEvent('Special Click', {
      Type: 'Clear all filter',
    });
    setSelectedFilters([]);
    setCurrentFilters([]);
    setGenderFilter('');
    setEducationFilter('');
    setMinAgeSelected(-1);
    setMaxAgeSelected(-1);
    setMinExperienceSelected(-1);
    setMaxExperienceSelected(-1);
    setExperienceSelected('');
    filterHandler([]);
    setCandidateDisabledVal({
      candidateLocked: false,
      candidateUnlocked: false,
    });
  };

  const handleFilterChange = (values): void => {
    let filters = values;
    filters = filters.filter((val) => genderFilters.indexOf(val) === -1);
    filters = filters.filter((val) => !val.includes('age'));
    filters = filters.filter((val) => !val.includes('experience'));
    // setting candidate locked/unlocked disablity
    setCandidateDisabledVal({
      candidateLocked: filters.includes('unlockCandidate'),
      candidateUnlocked: filters.includes('lockCandidate'),
    });
    if (genderFilter) {
      filters = [...filters, genderFilter];
    }
    if (maxAgeSelected !== -1 || minAgeSelected !== -1) {
      filters = [...filters, `age_min_${minAgeSelected !== -1 ? minAgeSelected : 0}`, `age_max_${maxAgeSelected !== -1 ? maxAgeSelected : 100}`, 'age_filter'];
    }
    if (maxExperienceSelected !== -1 || minExperienceSelected !== -1) {
      filters = [...filters, `experience_min_${minExperienceSelected !== -1 ? minExperienceSelected : 0}`, `experience_max_${maxExperienceSelected !== -1 ? maxExperienceSelected : 100}`, 'experience_filter'];
    }
    setCurrentFilters(filters);
    setSelectedFilters(filters);

    filterHandler(filters.length ? filters : undefined);
  };

  const filterTagHandler = (val): void => {
    let updatedFilters = [...currentFilters.filter(
      (currentFilterValue) => currentFilterValue !== val,
    )];
    if (genderFilters.indexOf(val) !== -1) {
      setGenderFilter('');
    }
    if (val.includes('age_filter')) {
      updatedFilters = selectedFilters.filter((value) => !value.includes('age'));
      setMinAgeSelected(-1);
      setMaxAgeSelected(-1);
    }
    if (val.includes('Candidate')) {
      setCandidateDisabledVal({
        candidateLocked: false,
        candidateUnlocked: false,
      });
    }

    setCurrentFilters(updatedFilters);
    setSelectedFilters(updatedFilters);
    filterHandler(updatedFilters);
  };

  useEffect(() => {
    if (clear) {
      clearAll();
    }
    // if (jobId) {
    //   jobFliterOnChange(jobId);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear]);

  useEffect(() => {
    // firstUpdate ref used to stop this from running on initial render
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    handleFilterChange(currentFilters);
  }, [genderFilter,
    maxAgeSelected,
    minAgeSelected,
    educationFilter,
    minExperienceSelected,
    maxExperienceSelected]);

  return (
    <Row className="application-tab-filters-container">
      <Col span={24}>
        {/* Filter Header  */}
        <Row justify="space-between" align="middle" className="filter-header" gutter={[8, 16]}>
          <Col span={24}>
            <Row justify="space-between">
              <Col className="font-bold text-medium">
                Filters
              </Col>
              <Col>
                <Button
                  type="link"
                  disabled={(selectedJobID === 'All Open Jobs' || selectedJobID === undefined) && selectedFilters === undefined}
                  onClick={clearAll}
                  className="filter-reset-btn"
                >
                  Clear all
                </Button>
              </Col>
            </Row>

          </Col>
          {selectedFilters.length ? (
            <Col span={24}>
              <Row className="filters-container" gutter={[4, 8]}>

                {selectedFilters.map((val) => (
                  ((!val.includes('age_m') && !val.includes('all') && !val.includes('experience_m'))
                    ? (
                      <Col key={Math.random()}>
                        <Tag
                          key={val}
                          closable
                          onClose={():void => filterTagHandler(val)}
                          className="text-large"
                          style={{ borderRadius: '20px', backgroundColor: '#f2f2f2', padding: '5px 15px' }}
                        >
                          {
                            (selectedFiltersDict[val] !== null ? selectedFiltersDict[val] : val)
                          }
                        </Tag>
                      </Col>
                    )
                    : null)
                ))}
              </Row>
            </Col>
          ) : null}

        </Row>
        <Row className="filters-container">
          <Col span={24}>
            <Row>
              <Col span={24} className="font-bold text-base p-bottom-8">
                Jobs
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Select
                  className="filter-jobs"
                  value={selectedJobID}
                  onChange={jobFliterOnChange}
                  allowClear
                >
                  {
                    openJobs.length > 0 && openJobs.map((job) => (
                      <Option
                        value={job.id}
                        key={job.id}
                        title={job.title}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {job.title}
                      </Option>
                    ))
                  }
                </Select>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="p-top-24">
                <Checkbox.Group value={selectedFilters} onChange={handleFilterChange} className="full-width">
                  <Row>
                    {isMobile ? <Row className="mobile-profile"> Profile</Row> : null}
                    <Collapse className="full-width collapse-banner site-collapse-custom-collapse" expandIconPosition="end" defaultActiveKey={['1']}>
                      <Panel header={<Text strong>Profile</Text>} key="1" className="site-collapse-custom-panel">
                        <Col span={24} className="filter-checks">
                          <Checkbox
                            value="pre_skilled"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'pre Skilled',
                            })}
                          >
                            <Space wrap>
                              <Text>Pre-skilled Candidates</Text>
                              <Tag className="success">New</Tag>
                            </Space>
                          </Checkbox>
                        </Col>
                        <Col span={24} className="filter-checks site-collapse-custom-panel">
                          <Checkbox
                            value="public_resume"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'CV available',
                            })}
                          >
                            CV Available
                          </Checkbox>
                        </Col>
                        <Col span={24} className="filter-checks">
                          <Checkbox
                            value="activeCandidate"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'Only Active candidate',
                            })}
                          >
                            Only Active candidate
                          </Checkbox>
                        </Col>
                        <Col span={24} className="filter-checks">
                          <Checkbox
                            value="unlockCandidate"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'Unlocked Candidate',
                            })}
                            disabled={candidateDisabledVal.candidateUnlocked}
                          >
                            Unlocked Candidate
                          </Checkbox>
                        </Col>
                        <Col span={24} className="filter-checks">
                          <Checkbox
                            value="lockCandidate"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'Locked Candidate',
                            })}
                            disabled={candidateDisabledVal.candidateLocked}
                          >
                            Locked Candidate
                          </Checkbox>
                        </Col>
                      </Panel>
                    </Collapse>
                    <Collapse className="full-width collapse-banner site-collapse-custom-collapse" expandIconPosition="end" defaultActiveKey={['1']}>
                      <Panel header={<Text strong>Education</Text>} key="2" className="site-collapse-custom-panel">
                        <Col span={24} className="filter-checks site-collapse-custom-panel">
                          <Checkbox
                            value="education_less_than_10th"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'Education less than 10th',
                            })}
                          >
                            Less Than 10
                          </Checkbox>
                        </Col>
                        <Col span={24} className="filter-checks site-collapse-custom-panel">
                          <Checkbox
                            value="education_10th"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'Education 10th',
                            })}
                          >
                            10th
                          </Checkbox>
                        </Col>
                        <Col span={24} className="filter-checks site-collapse-custom-panel">
                          <Checkbox
                            value="education_12th"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'Education 12th',
                            })}
                          >
                            12th
                          </Checkbox>
                        </Col>
                        <Col span={24} className="filter-checks site-collapse-custom-panel">
                          <Checkbox
                            value="education_diploma"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'Education Diploma',
                            })}
                          >
                            Diploma
                          </Checkbox>
                        </Col>
                        <Col span={24} className="filter-checks site-collapse-custom-panel">
                          <Checkbox
                            value="education_graduate"
                            onClick={(): void => pushClevertapEvent('Filters', {
                              Type: 'Generic',
                              Value: 'Education Graduate',
                            })}
                          >
                            Graduate
                          </Checkbox>
                        </Col>

                      </Panel>
                    </Collapse>
                  </Row>
                </Checkbox.Group>
                <Collapse className="full-width collapse-banner site-collapse-custom-collapse" expandIconPosition="end">
                  <Panel header={<Text strong>Age</Text>} key="3">
                    <Row>
                      <Col span={24}>
                        <Row justify="space-between">
                          <InputNumber
                            size="small"
                            style={{
                              borderBottom: '2px solid grey', borderRadius: 5, width: 50,
                            }}
                            value={minAgeSelected !== -1 ? minAgeSelected : 0}
                            onChange={(val: number | null): void => {
                              setMinAgeSelected(val || -1);
                              handleFilterChange(currentFilters);
                            }}
                            min={-1}
                            max={maxAgeSelected}
                          />
                          <InputNumber
                            size="small"
                            style={{
                              borderBottom: '2px solid grey', borderRadius: 5, width: 50,
                            }}
                            value={maxAgeSelected !== -1 ? maxAgeSelected : 70}
                            onChange={(val: number | null): void => {
                              setMaxAgeSelected(val || -1);
                              handleFilterChange(currentFilters);
                            }}
                            min={minAgeSelected}
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
                            (minAgeSelected !== -1 ? minAgeSelected : 0),
                            (maxAgeSelected !== -1 ? maxAgeSelected : 70)]}
                          onChange={(val):void => {
                            setMinAgeSelected(val[0]);
                            setMaxAgeSelected(val[1]);
                          }}
                          onAfterChange={():void => handleFilterChange(currentFilters)}
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
                              setMinExperienceSelected(0);
                              setMaxExperienceSelected(0);
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
                          <Slider
                            range
                            min={0}
                            max={20}
                            marks={experienceRangeMarks}
                            value={[
                              (minExperienceSelected !== -1 ? minExperienceSelected : 0),
                              (maxExperienceSelected !== -1 ? maxExperienceSelected : 2)]}
                            onChange={(val):void => {
                              setMinExperienceSelected(val[0]);
                              setMaxExperienceSelected(val[1]);
                            }}
                            onAfterChange={(val):void => {
                              handleFilterChange(currentFilters);
                            }}
                          />
                        </Col>
                      )}
                    </Row>

                  </Panel>
                </Collapse>
                <Radio.Group
                  className="full-width"
                  onChange={(e) => {
                    const gender:string = e.target.value;
                    setGenderFilter(gender);
                  }}
                  value={genderFilter}
                >
                  <Collapse className="full-width collapse-banner site-collapse-custom-collapse" expandIconPosition="end">
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
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
export default DatabaseFiltersComponent;
