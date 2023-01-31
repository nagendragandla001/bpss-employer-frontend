import React, { useState } from 'react';
import {
  Modal, Form, Input, Radio, Button, Row, Col, notification,
} from 'antd';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { SalaryFormat } from 'constants/enum-constants';
import Salary from 'constants/salary-constats';
import { nFormatter } from 'service/login-service';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import { isMobile } from 'mobile-device-detect';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType
  patchrequest:(string)=>void,
}
const EditSalary = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [salaryFormat, setsalaryFormat] = useState(data.salaryFormat);
  const [minSalary, setminSalary] = useState(data.minOfferSalary);
  const [maxSalary, setmaxSalary] = useState(data.maxOfferSalary);
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    const obj = {
      offer: {
        salary_format: formData.salaryFormat,
        min_offered_salary: parseInt(formData.minOfferedSalary, 10) || null,
        max_offered_salary: parseInt(formData.maxOfferedSalary, 10) || null,
      },
    };

    const apiCall = await patchJobChanges(data.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };
  const salaryValidations = (_rule, value): Promise<void> => {
    let minVal = minSalary;
    let maxVal = maxSalary;

    const val = !Number.isNaN(Number(value)) ? parseInt(value, 10) : null;

    if (_rule.field === 'minOfferedSalary' && val) {
      minVal = val;
    } else if (_rule.field === 'maxOfferedSalary' && val) {
      maxVal = val;
    }

    if (minVal !== null && maxVal !== null) {
      if (_rule.field === 'minOfferedSalary' && minVal !== null) {
        if (salaryFormat === 0) {
          if (data.employmentType === 'FT' && minVal < Salary.ANNAUL_MIN_FT) {
            return Promise.reject(new Error(Salary.ANNUAL_MIN_FT_MESSAGE));
          }
          if (data.employmentType !== 'FT' && minVal < Salary.ANNAUL_MIN_NON_FT) {
            return Promise.reject(new Error(Salary.ANNUAL_MIN_NON_FT_MESSAGE));
          }
          if (minVal > Salary.ANNUAL_MAX) {
            return Promise.reject(Salary.ANNUAL_MAX_MESSAGE);
          }
        } else if (salaryFormat === 1) {
          if (data.employmentType === 'FT' && minVal < Salary.MONTHLY_MIN_FT) {
            return Promise.reject(new Error(Salary.MONTHLY_MIN_FT_MESSAGE));
          }
          if (data.employmentType !== 'FT' && minVal < Salary.MONTHLY_MIN_NON_FT) {
            return Promise.reject(new Error(Salary.MONTHLY_MIN_NON_FT_MESSAGE));
          }
          if (minVal > Salary.MONTHLY_MAX) {
            return Promise.reject(new Error(Salary.MONTHLY_MAX_MESSAGE));
          }
        }
      } else if (_rule.field === 'maxOfferedSalary' && maxVal !== null) {
        if (maxVal < minVal) {
          return Promise.reject(new Error('The minimum salary cannot be greater than maximum salary'));
        }

        if (salaryFormat === 0) {
          if (data.employmentType === 'FT' && maxVal < Salary.ANNAUL_MIN_FT) {
            return Promise.reject(new Error(Salary.MAX_ANNUAL_FT_MESSAGE));
          }
          if (data.employmentType !== 'FT' && maxVal < Salary.ANNAUL_MIN_NON_FT) {
            return Promise.reject(new Error(Salary.MAX_ANNUAL_MIN_NON_FT_MESSAGE));
          }
          if (maxVal > Salary.ANNUAL_MAX) {
            return Promise.reject(Salary.MAX_ANNUAL_MAX_MESSAGE);
          }
        } else if (salaryFormat === 1) {
          if (data.employmentType === 'FT' && maxVal < Salary.MONTHLY_MIN_FT) {
            return Promise.reject(new Error(Salary.MAX_MONTHLY_MIN_FT_MESSAGE));
          }
          if (data.employmentType !== 'FT' && maxVal < Salary.MONTHLY_MIN_NON_FT) {
            return Promise.reject(new Error(Salary.MAX_MONTHLY_MIN_NON_FT_MESSAGE));
          }
          if (maxVal > Salary.MONTHLY_MAX) {
            return Promise.reject(new Error(Salary.MAX_MONTHLY_MAX_MESSAGE));
          }
        }
      }
    }
    return Promise.resolve();
  };
  return (
    <Modal
      visible={!!visible}
      footer={null}
      onCancel={onCancel}
      width={400}
      title="Edit Salary"
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
    >
      <Form
        layout="vertical"
        initialValues={{
          salaryFormat: data.salaryFormat,
          minOfferedSalary: data.minOfferSalary,
          maxOfferedSalary: data.maxOfferSalary,

        }}
        onFinish={finishHandler}
      >
        <Form.Item
          name="salaryFormat"
          label="Salary Period"
          style={{ marginBottom: 32 }}
        >

          <Radio.Group
            size="large"
            onChange={(e): void => {
              setsalaryFormat(e.target.value);
            //   store.aboutJob.basicInfo.updateSalaryPeriod(e.target.value);
            //   store.aboutJob
            //     .basicInfo.updatesoftobj(store.aboutJob.basicInfo.minOfferedSalary);
            //   store
            //     .aboutJob
            //     .basicInfo.updatesoftexpectobj(store.aboutJob.basicInfo.maxOfferedSalary);
            }}
            className="radio-buttons text-base"
          >
            {SalaryFormat.map((salary) => (
              <Radio.Button value={salary.value} key={salary.value}>
                {salary.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
        <Row gutter={30}>

          {/* Salary Range */}
          <Col
            xs={{ span: 24, offset: 0 }}
            md={{ span: 24, offset: 0 }}
          >
            <Form.Item
              noStyle
              style={{ marginBottom: 0 }}
              rules={[
                { validator: salaryValidations },
              ]}
            >
              <Row gutter={24}>

                {/* Min Salary Input */}
                <Col
                  xs={{ span: 12, offset: 0 }}
                  md={{ span: 12, offset: 0 }}
                >
                  <Form.Item
                    label="Min Salary"
                    name="minOfferedSalary"
                    validateFirst
                    rules={[
                      {
                        required: true,
                        message: 'Please input minimum salary!',
                      },
                      {
                        validator: salaryValidations,
                      },
                    ]}
                    style={{ marginBottom: 8 }}
                  >
                    <Input
                      type="number"
                      className="text-base"
                      value={`${data.minOfferSalary}`}
                      onChange={(e): void => {
                        setminSalary(parseInt(e.target.value, 10));
                        // store.aboutJob.basicInfo.updateMinSalary(e.target.value);
                      }}
                      //   onBlur={(e): void => {
                      //     // store.aboutJob.basicInfo.updatesoftobj(e.target.value);
                      //   }}
                      addonAfter={nFormatter(minSalary, 1) || ' '}
                      prefix="₹"
                    />
                  </Form.Item>
                </Col>

                {/* Max Salary Input */}
                <Col
                  xs={{ span: 12, offset: 0 }}
                  md={{ span: 12, offset: 0 }}
                >
                  <Form.Item
                    label="Max Salary"
                    name="maxOfferedSalary"
                    rules={[
                      {
                        required: true,
                        message: 'Please input maximum salary!',
                      },
                      { validator: salaryValidations },
                    ]}
                    style={{ marginBottom: 8 }}
                  >
                    <Input
                      type="number"
                      value={`${data.maxOfferSalary}`}
                      className="text-base"
                      onChange={(e): void => {
                        setmaxSalary(parseInt(e.target.value, 10));
                        // store.aboutJob.basicInfo.updateMaxSalary(e.target.value);
                      }}
                      //   onBlur={(e): void => {
                      //   //  store.aboutJob.basicInfo.updatesoftexpectobj(e.target.value);
                      //   }}
                      addonAfter={nFormatter(maxSalary, 1) || ' '}
                      prefix="₹"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
            {/* Soft Check */}
            {/* <Text className="soft-check-absolute">
              {store.aboutJob.basicInfo.softobj()
                ? store.aboutJob.basicInfo.softobj()
                : store.aboutJob.basicInfo.softexpectedobj()}
            </Text> */}

          </Col>
        </Row>
        {isMobile
          ? (
            <div className="m-ct-feedback-modal-footer-mobile">
              <Button
                htmlType="submit"
                type="primary"
                className="green-primary-btn"
                loading={submitInProgress}
              >
                Save Changes
              </Button>
            </div>
          )
          : (
            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                className="m-jobdetails-submit-btn"
                onClick={(): void => {
                  pushClevertapEvent('Special Click', { Type: 'Update Salary' });
                }}
                loading={submitInProgress}
              >
                Save Changes

              </Button>
            </Form.Item>
          ) }
      </Form>
    </Modal>
  );
};
export default EditSalary;
