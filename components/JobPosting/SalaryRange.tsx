import {
  Col, Form, Input, Row,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import Salary from 'constants/salary-constats';
import React from 'react';

interface ISalaryRange {
  employmentType: string;
  maxOfferedSalary: number;
  minOfferedSalary: number;
  updateMinSalaryChange: (value) => void;
  updateMaxSalaryChange: (value) => void;
}

const SalaryRange = (props: ISalaryRange): JSX.Element => {
  const {
    employmentType,
    maxOfferedSalary, minOfferedSalary,
    updateMinSalaryChange, updateMaxSalaryChange,
  } = props;

  const minSalaryValidations = (_rule, value): Promise<void> => {
    const formattedSalary = !Number.isNaN(Number(value)) ? parseInt(value, 10) : 0;

    if (formattedSalary) {
      if (employmentType === 'FT' && formattedSalary < Salary.MONTHLY_MIN_FT) {
        return Promise.reject(new Error(Salary.MONTHLY_MIN_FT_MESSAGE));
      }
      if (formattedSalary < Salary.MONTHLY_MIN_NON_FT) {
        return Promise.reject(new Error(Salary.MONTHLY_MIN_NON_FT_MESSAGE));
      }
      if (formattedSalary > Salary.MONTHLY_MIN_MAX) {
        return Promise.reject(new Error(Salary.MONTHLY_MIN_MAX_MESSAGE));
      }

      if (maxOfferedSalary && (formattedSalary > maxOfferedSalary)) {
        return Promise.reject(new Error('The minimum salary cannot be greater than maximum salary'));
      }
    }

    return Promise.resolve();
  };

  const maxSalaryValidations = (_rule, value): Promise<void> => {
    const formattedSalary = !Number.isNaN(Number(value)) ? parseInt(value, 10) : 0;

    if (formattedSalary) {
      if (employmentType === 'FT' && formattedSalary < Salary.MONTHLY_MIN_FT) {
        return Promise.reject(new Error(Salary.MAX_MONTHLY_MIN_FT_MESSAGE));
      }
      if (formattedSalary < Salary.MONTHLY_MIN_NON_FT) {
        return Promise.reject(new Error(Salary.MAX_MONTHLY_MIN_NON_FT_MESSAGE));
      }
      if (formattedSalary > Salary.MONTHLY_MAX) {
        return Promise.reject(new Error(Salary.MAX_MONTHLY_MAX_MESSAGE));
      }

      if (minOfferedSalary && (formattedSalary < minOfferedSalary)) {
        return Promise.reject(new Error('The maximum salary cannot be less than minimum salary'));
      }
    }

    return Promise.resolve();
  };

  const minSalaryChangeHandler = (e): void => {
    updateMinSalaryChange(parseInt(e.target.value, 10) || 0);
  };

  const maxSalaryChangeHandler = (e): void => {
    updateMaxSalaryChange(parseInt(e.target.value, 10) || 0);
  };

  return (
    <Form.Item label="Monthly Salary Range">
      <Row gutter={12} align="top">
        <Col xs={{ span: 10 }} lg={{ span: 8 }}>
          <Form.Item
            name="minOfferedSalary"
            validateFirst
            rules={[
              {
                required: true,
                message: 'Please input minimum salary!',
              },
              {
                validator: minSalaryValidations,
              },
            ]}
            style={{ marginBottom: 8 }}
            className="selected-values"
            dependencies={['maxOfferedSalary']}
            // extra={minSalaryWarnings()}
          >
            <Input
              type="number"
              min={1}
              className="text-base"
              onChange={minSalaryChangeHandler}
              prefix="₹"
            />
          </Form.Item>
        </Col>
        <Col xs={{ span: 3 }} lg={{ span: 2 }} style={{ paddingTop: '12px' }}>
          <CustomImage
            src="/images/common/two-sided-arrow.svg"
            alt="seperator"
            height={48}
            width={48}
          />
        </Col>
        <Col xs={{ span: 10 }} lg={{ span: 8 }}>
          <Form.Item
            name="maxOfferedSalary"
            rules={[
              {
                required: true,
                message: 'Please input maximum salary!',
              },
              { validator: maxSalaryValidations },
            ]}
            style={{ marginBottom: 8 }}
            className="selected-values"
            dependencies={['minOfferedSalary']}
            // extra={maxSalaryWarnings()}
          >
            <Input
              type="number"
              min={1}
              className="text-base"
              onChange={maxSalaryChangeHandler}
              prefix="₹"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );
};

export default SalaryRange;
