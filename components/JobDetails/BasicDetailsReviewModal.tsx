import {
  Button,
  Checkbox,
  Col, Form, FormInstance, Row, Space, Typography,
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { IJobPost } from 'common/jobpost.interface';
import JobType from 'components/JobPosting/JobType';
import React, { useState } from 'react';
import { isMobile } from 'mobile-device-detect';
import { ArrowLeftOutlined } from '@ant-design/icons';
import CustomImage from 'components/Wrappers/CustomImage';
import JobPostingConfig from 'constants/job-posting-constants';
import TextEditor from 'components/JobPosting/TextEditor';
import JobPostingGuidelines from 'components/Guidelines/JobPostingGuide';
import { onValidateDescription } from 'service/job-posting-service';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobPostingForm/BasicDetailsForm/BasicDetailsForm.less');
require('screens/authenticated/JobDetails/Mobile/editJobDetails/editJobDetails.less');

const { Text } = Typography;
interface IBasicDetailsReviewModal {
  visible: boolean;
  form: FormInstance;
  job: IJobPost;
  onClose: (value) => void;
  onSubmit: (value) => void;
  isNewUser: boolean;
}

const GuideLinesMessage = (
  <>
    Your job posting does not meet our rules. Please check
    {' '}
    <JobPostingGuidelines />
    {' '}
  </>
);

const BasicDetailsReviewModal = (props: IBasicDetailsReviewModal): JSX.Element => {
  const {
    visible, onClose, form, job, onSubmit, isNewUser,
  } = props;

  const [state, setState] = useState({
    employmentType: job?.employmentType,
    description: job?.description,
    clientApprovalRequired: job?.clientApprovalRequired,
  });

  const handleCancel = (): void => {
    onClose(false);
  };

  const handleFormFinish = async (data): Promise<void> => {
    onSubmit(data);
  };

  const handleJobTypeChange = (value): void => {
    setState((prev) => ({
      ...prev,
      employmentType: value,
    }));
  };

  const handleTextEditorChange = (content): void => {
    setState((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const validateDescription = async (_rule, value): Promise<void> => {
    const data = await onValidateDescription(_rule, value);

    switch (data) {
      case 'required': {
        return Promise.reject(new Error('Please enter about job description'));
        break;
      }
      case 'special_characters': {
        return Promise.reject(new Error('Only alphabets numbers and . / - ‘ ( )  are allowed'));
        break;
      }
      case 'minLength': {
        return Promise.reject(new Error('Min length of 30 is required in job description'));
        break;
      }
      case 'maxLength': {
        return Promise.reject(new Error('Please use job description with less than 500 charachters'));
        break;
      }
      case 'profane_words': {
        return Promise.reject(GuideLinesMessage);
        break;
      }
      default: {
        return Promise.resolve();
      }
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
              <Text strong className="text-base">Edit Job Details</Text>
            </Col>
            <Col className="m-clear-all">
              <Button form="basicDetailsModal" type="text" htmlType="submit"><Text strong className="modal-button">Save</Text></Button>
            </Col>
          </Row>,
        ]
        : 'Edit Job Details'}
      visible={visible}
      onCancel={handleCancel}
      footer={false}
      className={isMobile ? 'full-screen-modal m-jd-modal-container' : ''}
      closable={!isMobile}
    >
      <Form
        id="basicDetailsModal"
        form={form}
        name="review-job-details"
        layout="vertical"
        requiredMark={false}
        onFinish={handleFormFinish}
        onValuesChange={onValuesChange}
        initialValues={{
          title: job?.title,
          functionalArea: job?.functionalArea?.id,
          employmentType: job?.employmentType,
          description: job?.description,
          clientApprovalRequired: job?.clientApprovalRequired,
        }}
      >
        <Row>
          <Col span={24}>
            <JobType updateJobType={handleJobTypeChange} />
          </Col>
          {/* Allow Direct Interviews */}
          <Col span={24} className="m-v-auto">
            <Form.Item
              name={JobPostingConfig.clientApprovalRequired.name}
              valuePropName="checked"
              extra={(
                <Text className="form-help-text">
                  <CustomImage
                    src="/icons/tooltip.svg"
                    height={10}
                    width={9}
                    alt="icon"
                  />
                  &nbsp;
                  Selecting this option will allow candidates to
                  directly schedule interviews for this job.
                </Text>
              )}
            >
              <Checkbox
                disabled={['J_D', 'J_O'].includes(job.state) && job.stage !== 'J_UA'}
              >
                {JobPostingConfig.clientApprovalRequired.label}
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={{ span: 22 }} lg={{ span: 24 }}>
            <Form.Item
              name="description"
              label="Job Description"
              validateFirst
              rules={[
                {
                  validator: validateDescription,
                },
              ]}
              extra={(
                <Space>
                  <CustomImage
                    className="form-help-text"
                    src="/icons/tooltip.svg"
                    height={10}
                    width={9}
                    alt="icon"
                  />
                  <Text className="form-help-text">Maximum 500 characters allowed.</Text>
                </Space>
              )}
            >
              <TextEditor
                value={state?.description || ''}
                onChange={handleTextEditorChange}
              />
            </Form.Item>
          </Col>
        </Row>
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

      </Form>
    </Modal>

  );
};

export default BasicDetailsReviewModal;
