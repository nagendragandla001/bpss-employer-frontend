/* eslint-disable react/require-default-props */
import {
  Button, Checkbox, Col, Form, Modal, Row, Typography,
} from 'antd';
import { JobPostingConfig } from 'constants/index';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import JobRole from 'components/JobPosting/JobRole';
import { functionalAreaElasticFilter } from 'utils/job-posting-utils';
import { functionalAreaDescriptionAPI } from 'service/job-posting-service';
import JobCategory from 'components/JobPosting/JobCategory';
import HiringCompany from 'components/JobPosting/HiringCompany';
import { ArrowLeftOutlined } from '@ant-design/icons/lib/icons';

const { Text } = Typography;

type PropsModel = {
  onCancel: () => void,
  jobData: any,
  patchrequest: (msg: string) => void;
  form:any
  orgType: string;
}

const EditJobTitle = (props: PropsModel): JSX.Element => {
  const {
    onCancel, jobData, patchrequest, form, orgType,
  } = props;

  const [state, setState] = useState({
    disableCategory: true,
    title: jobData?.title,
    functionalArea: jobData?.functionalArea?.id,
    description: jobData?.description,
    hiringOrgName: jobData?.hiringOrgName,
  });
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    const obj = {
      title: formData.title,
      hiring_org_name: formData.hiringOrgName || '',
    };
    const apiCall = await patchJobChanges(jobData.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      // pushClevertapEvent('Special Click', { Type: 'Update Job Title' });
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
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
  return (
    <Modal
      visible
      className="full-screen-modal m-jd-modal-container"
      closable={false}
      footer={null}
      destroyOnClose
      title={[
        <Row justify="space-between" key="filter-title">
          <Col>
            <Button onClick={onCancel} type="link">
              <ArrowLeftOutlined />
            </Button>
            <Text strong className="text-base">Edit Job Title</Text>
          </Col>
          {/* <Col className="m-clear-all">
            <Button
              loading={submitInProgress}
              onClick={finishHandler}
              type="text"
            >
              <Text strong className="modal-button">Save</Text>

            </Button>
          </Col> */}
        </Row>,
      ]}
    >
      <Form
        layout="vertical"
        hideRequiredMark
        initialValues={{
          title: jobData.title,
          functionalArea: jobData?.functionalArea?.id,
          employmentType: jobData?.employmentType,
          ownCompany: jobData?.hiringOrgName !== '',
          hiringOrgName: jobData?.hiringOrgName,
        }}
        onFinish={finishHandler}
      >

        {/* Hiring Org Name */}

        <Row>
          <Col span={24}>
            <JobRole updateJobRole={jobRoleHandler} disabled={jobData.disableFields} />
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

        </Row>

        <Form.Item className="modal-action">
          <Button
            type="primary"
            block
            htmlType="submit"
            onClick={(): void => {
              pushClevertapEvent('Special Click', { Type: 'Update Job Title' });
            }}
            loading={submitInProgress}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditJobTitle;
