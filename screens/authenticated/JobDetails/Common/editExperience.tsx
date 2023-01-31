import {
  Button, Checkbox, Col, Form, Modal, Row, Select,
} from 'antd';
import {
  exp,
} from 'constants/enum-constants';
import { isMobile } from 'mobile-device-detect';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

const { Option } = Select;
const JobCategorySugg = dynamic(() => import('components/StaticPages/Common/JobCategory/JobCategorySugg.component'), { ssr: false });
const IndustryType = dynamic(() => import('screens/authenticated/JobDetails/Common/editIndustry'), { ssr: false });
interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType
  patchrequest:(string)=>void,
}

const JobExperience = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const exparr = exp();

  const [form] = Form.useForm();

  const finishHandler = async (formData):Promise<void> => {
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
    const apiCall = await patchJobChanges(data.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
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

  const getinitialCandidateArea = (candidateData): Array<number> => {
    const initCandidateFunctionalarea = [] as Array<number>;
    for (let i = 0; i < candidateData.length; i += 1) {
      initCandidateFunctionalarea.push(candidateData[i].id);
    }
    return initCandidateFunctionalarea;
  };

  return (
    <Modal
      visible={!!visible}
      footer={null}
      onCancel={onCancel}
      width={400}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      title="Edit Experience"
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          minExp: data.minExp,
          maxExp: data.maxExp,
          experienceRangeMandatory: data.experienceMandatory,
          functionalAreaId:
         data.candidateFunctionalarea.length > 0
           ? getinitialCandidateArea(data.candidateFunctionalarea)
           : [],
          industryType: data.candidateIndustries.length > 0
            ? getinitialCandidateArea(data.candidateIndustries)
            : [],
          industryTypeMandatory: data.industryMandatory,
        }}
        onFinish={finishHandler}
      >
        <Row>
          <Col xs={{ span: 24 }} md={{ span: 16 }}>
            <Form.Item
              name="experienceRangeMandatory"
              valuePropName="checked"
              style={{
                position: 'absolute',
                top: -14,
                zIndex: 1,
              }}
              className={isMobile ? 'jobdetails-m-mandatory-edit-modal' : 'jobdetails-mandatory-edit-modal '}
            >
              <Checkbox
                className="mandatory-checkbox"
              >
                <span className="mandatory-text">Mandatory</span>
              </Checkbox>
            </Form.Item>

            {/* Minimum Eperience */}
            <Form.Item label="Range of Experience" name="exp">
              <Row style={{ width: '350px' }}>
                {/* Minimum Experience */}
                <Col className={isMobile ? 'jobdetails-m-col-width ' : 'jobdetails-col-width '}>
                  <Form.Item name="minExp" noStyle>
                    <Select
                      className="text-base"
                      placeholder="Minimum Experience"
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
                <Col xs={{ span: 2 }} md={{ span: 2 }} style={{ marginTop: '0.5rem' }} className="text-center">
                  <span>To</span>
                </Col>

                {/* Max Experience */}
                <Col className={isMobile ? 'jobdetails-m-col-width ' : 'jobdetails-col-width '}>
                  <Form.Item
                    name="maxExp"
                    noStyle
                    rules={[
                      { validator: checkExp },
                    ]}
                  >
                    <Select
                      className="text-base"
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
        </Row>
        <Row className={isMobile ? 'jobdetails-m-row-width' : 'jobdetails-row-width'}>
          <Col className={isMobile ? 'jobdetails-m-row-width' : 'jobdetails-row-width'}>
            <JobCategorySugg
              name="functionalAreaId"
              mode="multiple"
              selectHandler={(): boolean => true}
              label="Previous Job Type"
              disabled={false}
              showArrow
            />
          </Col>
        </Row>

        {/* Industry Type */}
        <Row style={{ width: '350px' }}>
          <Col style={{ width: '350px' }}>
            <IndustryType />
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
                  pushClevertapEvent('Candidate Requirement Save', { Type: 'Experience' });
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
export default JobExperience;
