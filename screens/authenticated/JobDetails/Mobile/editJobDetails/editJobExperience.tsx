import {
  Button, Checkbox, Col, Form, Modal, Row, Select, Typography,
} from 'antd';
import { exp } from 'constants/enum-constants';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { JobDetailsType } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';

const JobCategorySugg = dynamic(() => import('components/StaticPages/Common/JobCategory/JobCategorySugg.component'), { ssr: false });
const JobIndustry = dynamic(() => import('screens/authenticated/JobDetails/Mobile/editJobDetails/jobIndustry'), { ssr: false });

const { Text } = Typography;
const { Option } = Select;

type PropsModel = {
  onCancel: () => void,
  jobData: JobDetailsType,
  patchrequest: (msg) => void
}

const EditJobExperience = (props: PropsModel): JSX.Element => {
  const { onCancel, jobData, patchrequest } = props;
  const [form] = Form.useForm();
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const exparr = exp();

  const getIds = (data): Array<any> => {
    if (data && data.length > 0) {
      return data.map((d) => d.id);
    }
    return [];
  };
  const checkExp = (_rule, value): Promise<void> => {
    let min = form.getFieldValue('minExp');
    if (min != null || value != null) {
      min = parseInt(min, 10);
      const maxvalue = parseInt(value, 10);
      if (maxvalue < min) {
        return Promise.reject(new Error('The minimum experience cannot be greater than maximum experience'));
      }
    }
    return Promise.resolve();
  };

  const finishHandler = async (formData): Promise<void> => {
    setSubmitInProgress(true);
    const obj = {
      expectation: {
        work_exp_requirements: {
          min_experience: formData.minExp || 0,
          functional_area_ids: formData.functionalAreaId || [],
          industry_ids: formData.industryType || [],
          is_industries_mandatory: formData.industryTypeMandatory || false,
          is_experience_mandatory: formData.experienceRangeMandatory || false,
        },
        max_experience: formData.maxExp || 0,
      },
    };
    const apiCall = await patchJobChanges(jobData.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };

  return (
    <Modal
      visible
      className="full-screen-modal m-jd-modal-container"
      closable={false}
      footer={null}
      destroyOnClose
      title={[
        <Row key="job-details">
          <Col onClick={onCancel}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
          <Col className="m-v-auto"><Text className="title">Edit Experience</Text></Col>
        </Row>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        hideRequiredMark
        initialValues={{
          minExp: jobData.minExp,
          maxExp: jobData.maxExp,
          experienceRangeMandatory: jobData.experienceMandatory,
          functionalAreaId: getIds(jobData.candidateFunctionalarea),
          industryType: getIds(jobData.candidateIndustries),
          industryTypeMandatory: jobData.industryMandatory,
        }}
        onFinish={finishHandler}
      >
        <Row>
          <Col span={24}>
            <Form.Item
              name="experienceRangeMandatory"
              valuePropName="checked"
              style={{
                position: 'absolute',
                top: -8,
                right: -7,
                zIndex: 1,
              }}
            >
              <Checkbox className="mandatory-checkbox">
                <span className="mandatory-text">Mandatory</span>
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={24}>
            {/* Minimum Eperience */}
            <Form.Item label="Educational Requirement" name="exp">
              <Row>
                {/* Minimum Experience */}
                <Col span={11}>
                  <Form.Item name="minExp" noStyle>
                    <Select
                      className="text-base"
                      placeholder="Minimum Experience"
                      size="large"
                    >
                      {
                        exparr.map((minexpvalue) => (
                          <Option
                            value={minexpvalue.months}
                            title={minexpvalue.years}
                            key={Math.random()}
                          >
                            {minexpvalue.years}
                          </Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                </Col>

                {/* Divider */}
                <Col span={2} className="text-center m-v-auto">
                  <Text>To</Text>
                </Col>

                {/* Max Experience */}
                <Col span={11}>
                  <Form.Item
                    name="maxExp"
                    noStyle
                    rules={[
                      { validator: checkExp },
                    ]}
                  >
                    <Select
                      className="text-base"
                      size="large"
                      placeholder="Maximum Experience"
                    >
                      {
                        exparr.map((maxexpvalue) => (
                          <Option
                            value={maxexpvalue.months}
                            title={maxexpvalue.years}
                            key={Math.random()}
                          >
                            {maxexpvalue.years}
                          </Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
          <Col span={24}>
            <JobCategorySugg
              name="functionalAreaId"
              mode="multiple"
              selectHandler={(): boolean => true}
              label="Previous Job Type"
              disabled={false}
              showArrow
            />
          </Col>
          <Col span={24}>
            <JobIndustry />
          </Col>
        </Row>
        <Form.Item className="modal-action">
          <Button
            type="primary"
            block
            htmlType="submit"
            onClick={(): void => {
              pushClevertapEvent('Candidate Requirement Edit', { Type: 'Experience' });
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

export default EditJobExperience;
