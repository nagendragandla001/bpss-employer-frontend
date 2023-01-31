import { Row, Col } from 'antd';
import ApplicationsFiltersComponent from 'components/Candidates/ApplicationsFilters';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import qs from 'query-string';
import AccountSummary from 'screens/authenticated/ApplicationsTab/Desktop/AccountSummary';
import { ContextType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';

interface PropsType {
  context: ContextType;
  updateFilter: (obj: unknown) => void;
}

const ApplicationFilterContainer = (props: PropsType): JSX.Element => {
  const { context, updateFilter } = props;
  const router = useRouter();
  const { contactUnlocksLeft, totalContactUnlocks } = context;

  const [jobId, setJobId] = useState<any>();
  const [filter, setFilter] = useState<string[]>([]);
  const [clearfilter] = useState(false);
  const [state, setState] = useState({
    jobId: '',
    filters: [],
    visited: false,
  });

  const jobFliterHandler = (data):void => {
    setState((prevState) => ({
      ...prevState,
      jobId: data,
    }));
    updateFilter({ jobId: data });
  };

  const filterHandler = (data) :void => {
    updateFilter({ filter: data || [] });
    setFilter(data);
  };

  useEffect(() => {
    // window.scrollTo(0, 0);
    if (!state.visited) {
      if (router && router.query && router.query.filter) {
        const selectedParams = qs.parse(router.query.filter.toString(), { parseBooleans: true });
        if (selectedParams.job) {
          setJobId(selectedParams.job);
          delete selectedParams.job;
        }
        let params = [] as any;
        params = Object.keys(selectedParams);
        setFilter(params);
        //  updateFilter(Object.keys(selectedParams));
        setState((prevState) => ({
          ...prevState,
          visited: true,
        }));
        return;
      }
      setState((prevState) => ({
        ...prevState,
        visited: true,
      }));
    }
  }, [router, state.visited]);

  return (
    <Row gutter={[0, 7]}>
      <Col span={24}>
        <AccountSummary
          text="Application Unlocks Used"
          remaining={contactUnlocksLeft}
          total={totalContactUnlocks}
        />
      </Col>
      <Col span={24} className="application-tab-filters-container">
        <ApplicationsFiltersComponent
          jobFilterHandler={jobFliterHandler}
          filterHandler={filterHandler}
          filter={filter}
          clear={clearfilter}
          jobId={jobId}
        />
      </Col>
    </Row>
  );
};

export default ApplicationFilterContainer;
