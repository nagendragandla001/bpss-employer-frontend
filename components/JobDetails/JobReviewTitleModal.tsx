import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Modal, Form, FormInstance, Row, Col, Checkbox, Space, Button, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import HiringCompany from 'components/JobPosting/HiringCompany';
import JobCategory from 'components/JobPosting/JobCategory';
import JobRole from 'components/JobPosting/JobRole';
import { JobPostingConfig } from 'constants/index';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { functionalAreaDescriptionAPI } from 'service/job-posting-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { functionalAreaElasticFilter } from 'utils/job-posting-utils';

const { Text } = Typography;

interface IJobReviewTitleModal {
  visible: boolean;
  job: IJobPost;
  form: FormInstance;
  orgType: string;
  onClose: () => void;
  onSubmit: (data) => void;
  isNewUser: boolean;
}

const JobReviewTitleModal = (props: IJobReviewTitleModal): JSX.Element => {
  const {
    visible, job, form, onClose, onSubmit, orgType, isNewUser,
  } = props;
  // console.log(job);
  const [state, setState] = useState({
    showHiringOrg: job?.hiringOrgName !== '',
    disableCategory: true,
    title: job?.title,
    functionalArea: job?.functionalArea?.id,
    description: job?.description,
    hiringOrgName: job?.hiringOrgName,
  });

  const handleFormFinish = (): void => {
    onSubmit(state);
  };

  const jobRoleHandler = async (role): Promise<void> => {
    setState((prev) => ({
      ...prev,
      title: role?.job_designation,
      functionalArea: role?.functional_areas || '',
      disableCategory: !!role?.functional_areas,
    }));

    form.setFieldsValue({
      functionalArea: role.functional_areas,
    });

    if (role?.functional_areas) {
      const filters = functionalAreaElasticFilter(role.functional_areas);
      const response = await functionalAreaDescriptionAPI(filters);

      setState((prev) => ({
        ...prev,
        description: response?.objects[0]?.jobs_fa_description || state.description,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        disableCategory: false,
      }));
    }
  };

  const jobCategoryHandler = async (category): Promise<void> => {
    const filters = functionalAreaElasticFilter(category.value);
    const response = await functionalAreaDescriptionAPI(filters);

    setState((prev) => ({
      ...prev,
      functionalArea: category.value,
      description: response?.objects[0]?.jobs_fa_description || state.description,
    }));
  };

  const handleCompanyChange = (event): void => {
    // console.log(event.target.checked);
    setState((prev) => ({
      ...prev,
      showHiringOrg: event?.target?.checked,
    }));
    if (!event?.target?.checked) {
      setState((prev) => ({
        ...prev,
        hiringOrgName: '',
      }));
    }
  };

  const hiringCompanyHandler = (data): void => {
    setState((prev) => ({
      ...prev,
      hiringOrgName: data,
    }));
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
              <Button onClick={onClose} type="link">
                <ArrowLeftOutlined />
              </Button>
              <Text strong className="text-base">Edit Job Role</Text>
            </Col>
            <Col className="m-clear-all">
              <Button form="jobReviewTitleModal" type="text" htmlType="submit"><Text strong className="modal-button">Save</Text></Button>
            </Col>
          </Row>,
        ]
        : 'Edit Job Role'}
      visible={visible}
      onCancel={onClose}
      footer={false}
      className={isMobile ? 'full-screen-modal m-jd-modal-container' : ''}
      closable={!isMobile}
    >
      <Form
        id="jobReviewTitleModal"
        form={form}
        name="review-job-details"
        layout="vertical"
        requiredMark={false}
        onValuesChange={onValuesChange}
        onFinish={handleFormFinish}
        initialValues={{
          title: job?.title,
          functionalArea: job?.functionalArea?.id,
          employmentType: job?.employmentType,
          ownCompany: job?.hiringOrgName !== '',
          hiringOrgName: job?.hiringOrgName,
        }}
      >
        <Row align="middle" gutter={65}>
          <Col span={24}>
            <JobRole updateJobRole={jobRoleHandler} disabled={job.disableFields} />
          </Col>
          <Col span={24}>
            <JobCategory
              name="functionalArea"
              label="Job Category"
              selectHandler={jobCategoryHandler}
              disabled={state.disableCategory}
              showArrow={false}
            />
          </Col>
          {/* <Col span={24}>
            <Form.Item
              name={JobPostingConfig.ownCompany.name}
              valuePropName="checked"
              style={{ marginBottom: 16 }}
            >
              <Checkbox onChange={handleCompanyChange}>
                {JobPostingConfig.ownCompany.label}
              </Checkbox>
            </Form.Item>
          </Col> */}
          {
            ['HR', 'IND'].includes(orgType) && (
              <Col span={24}>
                <HiringCompany
                  form={form}
                  visible={['HR', 'IND'].includes(orgType)}
                  selectHandler={hiringCompanyHandler}
                />
              </Col>
            )
          }
          <Col md={{ span: 24 }} xs={{ span: 0 }} className="text-center">
            <Space align="center">
              <Button
                size="small"
                type="link"
                className="text-semibold"
                onClick={onClose}
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

export default JobReviewTitleModal;
