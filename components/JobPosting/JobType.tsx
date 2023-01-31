import { Form, Radio } from 'antd';
import { EMPLOYMENT_TYPE } from 'constants/enum-constants';
import JobPostingConfig from 'constants/job-posting-constants';
import React from 'react';
import { isMobile } from 'mobile-device-detect';

interface IJobType {
  updateJobType: (value) => void
}

const JobType = (props: IJobType): JSX.Element => {
  const { updateJobType } = props;

  const handleJobTypeChange = (e): void => {
    updateJobType(e?.target?.value);
  };

  return (
    <Form.Item
      label={JobPostingConfig.employmentType.label}
      name={JobPostingConfig.employmentType.name}

    >
      <Radio.Group
        size={isMobile ? 'small' : 'middle'}
        className="radio-buttons text-base"
        onChange={handleJobTypeChange}

      >
        {
          EMPLOYMENT_TYPE.map((jobType) => (
            <Radio.Button key={jobType.key} value={jobType.key} className=" selected-values">
              {jobType.label}
            </Radio.Button>
          ))
        }
      </Radio.Group>
    </Form.Item>
  );
};

export default JobType;
