import { Form, Select } from 'antd';
import { EDUCATION } from 'constants/enum-constants';
import React from 'react';

const { Option } = Select;

interface IEducation {
  updateEducation: (value) => void
}

const Education = (props: IEducation): JSX.Element => {
  const { updateEducation } = props;

  return (
    <Form.Item label="Minimum Educational Requirement" name="proficiencyLevel">
      <Select onChange={updateEducation} className="text-base text-bold">
        {
          EDUCATION.map((degree) => (
            <Option
              key={degree.value}
              value={degree.value}
            >
              {degree.label}
            </Option>
          ))
        }
      </Select>
    </Form.Item>
  );
};

export default Education;
