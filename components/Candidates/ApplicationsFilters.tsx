/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import {
  Row, Col, Select, Button, Tag,
} from 'antd';
import { allJobAPI } from 'service/application-card-service';
import { pushClevertapEvent } from 'utils/clevertap';
import CommonFilters from 'components/Candidates/CommonFilters';
import { applicationStageFilters, selectedFiltersDict } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

require('components/Candidates/ApplicationsFilters.less');

const { Option, OptGroup } = Select;
interface FilterProps {
  jobFilterHandler:(any) => void;
  filterHandler:(any)=>void;
  filter: Array<string> | undefined;
  clear:boolean;
  jobId: string | undefined;
}

type jobsType = {
  title: string,
  id: string,
}

const ApplicationsFiltersComponent: React.FunctionComponent <FilterProps> = (props:FilterProps) => {
  const {
    jobFilterHandler, filterHandler, filter, clear, jobId,
  } = props;
  const [selectedJobID, setSelectedJobID] = useState(jobId || 'All Open Jobs');

  const [openJobs, setOpenJobs] = useState<Array<jobsType>>([]);
  const [pausedJobs, setPausedJobs] = useState<Array<jobsType>>([]);
  const [closedJobs, setClosedJobs] = useState<Array<jobsType>>([]);

  const add = (arr, name): any[] => {
    const found = arr.some((el) => el.id === name.id);
    if (!found) arr.push(name);
    return arr;
  };

  useEffect(() => {
    const getOrgJobs = async (): Promise<void> => {
      const tempOpenJobs: Array<jobsType> = [];
      const tempPausedJobs: Array<jobsType> = [];
      const tempClosedJobs: Array<jobsType> = [];
      const apiCall = await allJobAPI();
      const response = await apiCall.data;

      if (response && response.objects && response.objects.length) {
        for (let i = 0; i < response.objects.length; i += 1) {
          if (response.objects[i]._source.state === 'J_O') {
            const obj = { id: response.objects[i]._id, title: response.objects[i]._source?.title };
            add(tempOpenJobs, obj);
          } else if (response.objects[i]._source.state === 'J_P') {
            const obj = { id: response.objects[i]._id, title: response.objects[i]._source.title };
            add(tempPausedJobs, obj);
          } else if (response.objects[i]._source.state === 'J_C') {
            const obj = { id: response.objects[i]._id, title: response.objects[i]._source?.title };
            add(tempClosedJobs, obj);
          }
        }
        setOpenJobs(tempOpenJobs);
        setPausedJobs(tempPausedJobs);
        setClosedJobs(tempClosedJobs);
      }
    };
    getOrgJobs();
  }, []);

  const jobFliterOnChange = (value):void => {
    setSelectedJobID(value);
    jobFilterHandler(value);

    let selectedjob = openJobs.filter((job) => job.id === value);

    if (selectedjob.length === 0) {
      selectedjob = closedJobs.filter((job) => job.id === value);
      if (selectedjob.length === 0) { selectedjob = pausedJobs.filter((job) => job.id === value); }
    }

    if (selectedjob !== undefined && selectedjob.length > 0) pushClevertapEvent('Filters', { Type: 'Jobs', Value: `${selectedjob[0].title}` });
  };

  const childRef = useRef() as any;

  const clearAll = (): void => {
    pushClevertapEvent('Special Click', {
      Type: 'Clear all filter',
    });
    // setSelectedJobID('All Open Jobs');
    childRef.current.resetFilter();
    // jobFilterHandler(undefined);
  };

  useEffect(() => {
    if (clear) {
      clearAll();
    }
    if (jobId) {
      jobFliterOnChange(jobId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear, jobId]);

  const getFilters = (stageFilter):Array<string> => {
    if (!filter) return [];
    let stage: Array<string> = [];
    const commonFilters = filter.filter((val) => !['job', 'filter'].includes(val));
    if (stageFilter) {
      stage = commonFilters.filter(
        (item) => applicationStageFilters.indexOf(item) !== -1,
      );
    } else if (!stageFilter) {
      stage = commonFilters.filter(
        (item) => applicationStageFilters.indexOf(item) === -1,
      );
    }
    return stage;
  };

  return (
    <Row className="application-tab-filters-container">
      <Col span={24}>
        {/* Filter Header  */}
        <Row justify="space-between" align="middle" className="filter-header">
          <Col className="font-bold text-medium">
            Filters
          </Col>
          <Col>
            <Button
              type="link"
              disabled={(selectedJobID === 'All Open Jobs' || selectedJobID === undefined) && filter === undefined}
              onClick={clearAll}
              className="filter-reset-btn"
            >
              Clear all
            </Button>
          </Col>
        </Row>
        {(getFilters(false).length > 0 || getFilters(true).length > 0) ? (
          <Row className="filters-container" gutter={[4, 8]}>
            {getFilters(false)?.map((val) => (
              // eslint-disable-next-line no-nested-ternary
              ((!val.includes('age_m') && !val.includes('all') && !val.includes('experience_m'))
                ? (
                  <Col key={val}>
                    <Tag
                      key={val}
                      closable
                      onClose={():void => { childRef.current.removeFilter(val); }}
                      className="text-large"
                      style={{ borderRadius: '20px', backgroundColor: '#f2f2f2', padding: '5px 15px' }}
                    >
                      {
                        (selectedFiltersDict[val] !== null ? selectedFiltersDict[val] : val)
                      }
                    </Tag>
                  </Col>
                )
                : null
              )))}
            {getFilters(true)?.map((val) => (
              // eslint-disable-next-line no-nested-ternary
              (!val.includes('age_m')
                ? (
                  <Col key={val}>
                    <Tag
                      key={val}
                      closable
                      onClose={():void => { childRef.current.removeFilter(val); }}
                      className="text-large"
                      style={{ borderRadius: '20px', backgroundColor: '#f2f2f2', padding: '5px 15px' }}
                    >
                      {val}
                    </Tag>
                  </Col>
                )
                : null
              )))}
          </Row>
        ) : null}

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
                  placeholder="All Open Jobs"
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
                        <Option key={`passed-${job.id}`} value={job.id} title={job.title}>{job.title}</Option>
                      ))
                    }
                  </OptGroup>
                </Select>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="p-top-24">
                <CommonFilters
                  filterHandler={filterHandler}
                  ref={childRef}
                  jobId={selectedJobID !== 'All Open Jobs' ? selectedJobID : ''}
                  selectedFilters={getFilters(false)}
                  selectedStage={getFilters(true)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>

  );
};
export default ApplicationsFiltersComponent;
