/* eslint-disable camelcase */
import {
  Button, Checkbox, Col, Form, Modal, Row, Space, Typography,
} from 'antd';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import JobType from 'components/JobPosting/JobType';
import JobPostingConfig from 'constants/job-posting-constants';
import ArrowLeftOutlined from '@ant-design/icons/lib/icons/ArrowLeftOutlined';
import JobPostingGuidelines from 'components/Guidelines/JobPostingGuide';
import TextEditor from 'components/JobPosting/TextEditor';
import { onValidateDescription } from 'service/job-posting-service';

require('screens/authenticated/JobDetails/Mobile/editJobDetails/editJobDetails.less');

const GuideLinesMessage = (
  <>
    Your job posting does not meet our rules. Please check
    {' '}
    <JobPostingGuidelines />
    {' '}
  </>
);

const { Text } = Typography;

type PropsModel = {
  functionalArea: string,
  employmentType: string,
  description: string,
  title:string,
  id: string,
  onCancel: () => void,
  patchrequest: (msg: string) => void,
  jobData:any
}

const JobDetails = (props: PropsModel): JSX.Element => {
  const {
    functionalArea, employmentType, description, id, title, onCancel, patchrequest,
    jobData,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [form] = Form.useForm();
  const [state, setState] = useState({
    employmentType: jobData?.employmentType,
    description: jobData?.description,
    clientApprovalRequired: jobData?.clientApprovalRequired,
  });
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    const obj = {
      functional_area_id: formData.functionalArea,
      employment_type: formData.employmentType,
      description: formData.description,
      clientApprovalRequired: formData.clientApprovalRequired,
    };
    const apiCall = await patchJobChanges(id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      pushClevertapEvent('Special Click', { Type: 'Update Job Details' });
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
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

  return (
    <Modal
      visible
      className="full-screen-modal m-jd-modal-container"
      closable={false}
      footer={null}
      title={[
        <Row justify="space-between" key="filter-title">
          <Col>
            <Button onClick={onCancel} type="link">
              <ArrowLeftOutlined />
            </Button>
            <Text strong className="text-base">Edit Job Details</Text>
          </Col>
          {/* <Col className="m-clear-all">
            <Button onClick={finishHandler}
            type="text"><Text strong className="modal-button">Save</Text></Button>
          </Col> */}
        </Row>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        hideRequiredMark
        initialValues={{
          title,
          employmentType,
          functionalArea,
          description,
          clientApprovalRequired: jobData.clientApprovalRequired,
        }}
        onFinish={finishHandler}
      >
        {/* <JobCategorySugg
          name="functionalArea"
          label="Job Category"
          mode="single"
          selectHandler={():boolean => true}
          disabled={false}
          showArrow={false}
        /> */}

        {/* Employment Type */}
        <Col span={24}>
          <JobType updateJobType={handleJobTypeChange} />
        </Col>
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
              disabled={['J_D', 'J_O'].includes(jobData.state) && jobData.stage !== 'J_UA'}
            >
              {JobPostingConfig.clientApprovalRequired.label}
            </Checkbox>
          </Form.Item>
        </Col>
        <Col span={24}>
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

        <Form.Item className="modal-action">
          <Button
            type="primary"
            block
            htmlType="submit"
            loading={submitInProgress}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default JobDetails;
