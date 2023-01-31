import { Col, Row } from 'antd';
import DatabaseFiltersComponent from 'components/Candidates/DatabaseFilters';
import React, { useState } from 'react';
import { ContextType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';
import AccountSummary from 'screens/authenticated/ApplicationsTab/Desktop/AccountSummary';

interface PropsType {
  context: ContextType;
  updateFilter: (obj) => void;
}

const DatabaseFilterContainer = (props: PropsType): JSX.Element => {
  const { context, updateFilter } = props;
  const { databaseUnlocksLeft, totalDatabaseUnlocks } = context;
  const [clearfilter] = useState(false);

  const jobFilterHandler = (data): void => {
    updateFilter({ jobId: data.id, jobTitle: data.title });
  };

  const filterHandler = (data): void => {
    updateFilter({ filter: data || [] });
  };

  return (
    <Row gutter={[0, 7]}>
      <Col span={24}>
        <AccountSummary
          text="Database Unlocks Used"
          remaining={databaseUnlocksLeft}
          total={totalDatabaseUnlocks}
        />
      </Col>
      <Col span={24}>
        <DatabaseFiltersComponent
          jobFilterHandler={jobFilterHandler}
          filterHandler={filterHandler}
          clear={clearfilter}
        />
      </Col>
    </Row>
  );
};

export default DatabaseFilterContainer;
