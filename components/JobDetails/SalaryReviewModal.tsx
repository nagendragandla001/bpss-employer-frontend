import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button,
  Col, Form, FormInstance, Radio, Row, Space, Tag, TimePicker, Typography,
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { IJobPost } from 'common/jobpost.interface';
import SalaryRange from 'components/JobPosting/SalaryRange';
import WorkDay from 'components/JobPosting/WorkDay';
import CustomImage from 'components/Wrappers/CustomImage';
import JobPostingConfig from 'constants/job-posting-constants';
import { isMobile } from 'mobile-device-detect';
import moment from 'moment';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobPostingForm/BasicDetailsForm/BasicDetailsForm.less');

const { Text } = Typography;

interface ISalaryReviewModal {
  visible: boolean;
  form: FormInstance;
  job: IJobPost;
  onClose: (value) => void;
  onSubmit: (value) => void;
  isNewUser: boolean;
}

const SalaryReviewModal = (props: ISalaryReviewModal): JSX.Element => {
  const {
    visible, onClose, form, job, onSubmit, isNewUser,
  } = props;

  const [state, setState] = useState({
    minOfferedSalary: job?.minOfferedSalary,
    maxOfferedSalary: job?.maxOfferedSalary,
    workDays: job?.workDays,
    shiftType: job?.shiftType,
    shiftStartTime: moment(job?.shiftStartTime, 'HH:mm'),
    shiftEndTime: moment(job?.shiftEndTime, 'HH:mm'),
  });

  const handleCancel = (): void => {
    onClose(false);
  };

  const handleFormFinish = async (data): Promise<void> => {
    const formData = { ...data };
    formData.shiftStartTime = moment(formData.shiftStartTime).format('HH:mm:ss').toString();
    formData.shiftEndTime = moment(formData.shiftEndTime).format('HH:mm:ss').toString();
    formData.workDays = state?.workDays?.length || 5;
    onSubmit(formData);
  };

  const minSalaryChangeHandler = (value): void => {
    setState((prevState) => ({
      ...prevState,
      minOfferedSalary: value,
    }));
  };

  const maxSalaryChangeHandler = (value): void => {
    setState((prevState) => ({
      ...prevState,
      maxOfferedSalary: value,
    }));
  };

  const workingDayChangeHandler = (tag, checked): void => {
    const nextSelectedTags = checked ? [...state.workDays, tag]
      : state.workDays.filter((t) => t !== tag);
    setState((prev) => ({
      ...prev,
      workDays: nextSelectedTags,
    }));
  };

  const shiftTypeHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      shiftType: value,
    }));
    if (value.target.value === 'DAY') {
      form.setFieldsValue({ shiftStartTime: moment('09:00 AM', 'HH:mm') });
      form.setFieldsValue({ shiftEndTime: moment('18:00 PM', 'HH:mm') });
    } else {
      form.setFieldsValue({ shiftStartTime: moment('22:00 PM', 'HH:mm') });
      form.setFieldsValue({ shiftEndTime: moment('07:00 AM', 'HH:mm') });
    }
  };

  const onValuesChange = (formData): void => {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Review`,
      field_modified: Object.keys(formData)?.[0],
    });
  };

  return (
    <Modal
      title={isMobile
        ? [
          <Row justify="space-between" key="filter-title">
            <Col>
              <Button onClick={handleCancel} type="link">
                <ArrowLeftOutlined />
              </Button>
              <Text strong className="text-base">Edit Location and Openings</Text>
            </Col>
            <Col className="m-clear-all">
              <Button form="salaryReviewModal" type="text" htmlType="submit"><Text strong className="modal-button">Save</Text></Button>
            </Col>
          </Row>,
        ]
        : 'Edit Salary and Work hours'}
      className={isMobile ? 'full-screen-modal m-jd-modal-container' : ''}
      visible={visible}
      onCancel={handleCancel}
      footer={false}
      closable={!isMobile}
    >
      <Form
        id="salaryReviewModal"
        form={form}
        name="review-job-details"
        layout="vertical"
        requiredMark={false}
        onFinish={handleFormFinish}
        onValuesChange={onValuesChange}
        initialValues={{
          minOfferedSalary: job?.minOfferedSalary,
          maxOfferedSalary: job?.maxOfferedSalary,
          workDays: job?.workDays,
          shiftType: job?.shiftType,
          shiftStartTime: moment(job?.shiftStartTime, 'HH:mm'),
          shiftEndTime: moment(job?.shiftEndTime, 'HH:mm'),
        }}
      >
        <Row align="middle">
          <Col span={24}>
            <SalaryRange
              employmentType={job?.employmentType}
              minOfferedSalary={state?.minOfferedSalary}
              maxOfferedSalary={state?.maxOfferedSalary}
              updateMaxSalaryChange={maxSalaryChangeHandler}
              updateMinSalaryChange={minSalaryChangeHandler}
            />
          </Col>
          <Col span={24}>
            <WorkDay workDays={state?.workDays} updateWorkDay={workingDayChangeHandler} />
          </Col>
          <Col span={24}>
            <Row align="middle" justify="space-between">
              <Col md={{ span: 12 }} xs={{ span: 24 }}>
                <Form.Item
                  name={JobPostingConfig.shiftType.name}
                  label={JobPostingConfig.shiftType.label}
                >
                  <Radio.Group
                    size="large"
                    className="text-base"
                    onChange={shiftTypeHandler}
                  >
                    <Radio.Button value="DAY">Day</Radio.Button>
                    <Radio.Button value="NIGHT">Night</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col md={{ span: 12 }} xs={{ span: 24 }}>
                <Row justify="space-between" align="middle">
                  <Col span={10}>
                    <Form.Item
                      name={JobPostingConfig.shiftStartTime.name}
                      label={JobPostingConfig.shiftStartTime.label}
                    >
                      <TimePicker
                        minuteStep={30}
                        size="middle"
                        format="HH:mm"
                        suffixIcon={null}
                        allowClear={false}
                        className="text-base"
                        inputReadOnly
                        placeholder="From"
                        showNow={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <CustomImage
                      src="/images/common/two-sided-arrow.svg"
                      alt="seperator"
                      height={48}
                      width={48}
                    />
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      name={JobPostingConfig.shiftEndTime.name}
                      label={JobPostingConfig.shiftEndTime.label}
                    >
                      <TimePicker
                        minuteStep={30}
                        size="middle"
                        format="HH:mm"
                        suffixIcon={null}
                        allowClear={false}
                        className="text-base"
                        inputReadOnly
                        placeholder="To"
                        showNow={false}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col md={{ span: 24 }} xs={{ span: 0 }} className="text-center">
            <Space align="center">
              <Button
                size="small"
                type="link"
                className="text-semibold"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button size="small" type="primary" htmlType="submit">Continue</Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default SalaryReviewModal;
