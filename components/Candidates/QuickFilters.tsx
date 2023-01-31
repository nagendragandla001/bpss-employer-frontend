import React from 'react';
import Checkbox from 'antd/lib/checkbox';
import { pushClevertapEvent } from 'utils/clevertap';

require('components/Candidates/ApplicationsFilters.less');

interface QuickFilterProps {
  callbackfilter: (any) => void;
  filter:Array<string> | undefined;
  selectedTab: string;
}

const QuickFilters: React.FunctionComponent <QuickFilterProps> = (props: QuickFilterProps) => {
  const { callbackfilter, filter, selectedTab } = props;

  const handleChange = (value): void => {
    callbackfilter(value);
    pushClevertapEvent('Filters', { Type: 'Generic', Value: `${value}` });
  };

  return (
    <>
      {selectedTab === 'applications'
        ? (
          <Checkbox.Group onChange={handleChange} value={filter} className="m-at-quick-filters">
            <Checkbox value="public_resume" className="m-at-filter">CV Available</Checkbox>
            <Checkbox value="freeUnlock" className="m-at-filter">FREE Call Candidate</Checkbox>
            <Checkbox value="interviewToday" className="m-at-filter">Interview Today</Checkbox>
            <Checkbox value="interviewTomorrow" className="m-at-filter">Interview Tomorrow</Checkbox>
          </Checkbox.Group>
        ) : (
          <Checkbox.Group onChange={handleChange} value={filter} className="m-at-quick-filters">
            <Checkbox value="public_resume" className="m-at-filter">CV Available</Checkbox>
            <Checkbox value="unlockCandidate" className="m-at-filter">Unlocked Candidate</Checkbox>
          </Checkbox.Group>
        )}
    </>
  );
};

export default QuickFilters;
