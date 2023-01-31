/* eslint-disable camelcase */
import { Form, InputNumber } from 'antd';
import { JobPostingConfig } from 'constants/index';
import React from 'react';

interface IJobOpenings {
  updateJobOpenings: (obj) => void
}

const JobOpenings = (props: IJobOpenings): JSX.Element => {
  const { updateJobOpenings } = props;

  return (
    <Form.Item
      label={JobPostingConfig.vacancies.label}
      name={JobPostingConfig.vacancies.name}
      rules={[
        ...JobPostingConfig.vacancies.rules,
      ]}
      className="selected-values"
    >
      <InputNumber
        min={1}
        max={1000}
        className="text-base full-width selected-values"
        onChange={updateJobOpenings}
        placeholder="Openings"

      />
    </Form.Item>
  );
};

export default JobOpenings;
