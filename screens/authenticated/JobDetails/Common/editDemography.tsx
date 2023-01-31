import {
  Button, Checkbox, Col, Form, Modal, Radio, Row, Select,
} from 'antd';
import { ageList, constants } from 'constants/enum-constants';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType
  patchrequest:(string)=>void,
}
const { Option } = Select;
const JobDemography = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const agearr = ageList();
  const [form] = Form.useForm();
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    const obj = {
      expectation: {
        max_preferred_age: formData.maxAge ? parseInt(formData.maxAge, 10) : 0,
        min_preferred_age: formData.minAge ? parseInt(formData.minAge, 10) : 18,
        gender_preference: formData.genderType || '',
        is_age_pref_mandatory: formData.ageMandatory,
        is_gender_pref_mandatory: formData.genderMandatory,

      },
    };
    // console.log(obj);
    const apiCall = await patchJobChanges(data.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };
  const checkAge = (_rule, value): Promise<void> => {
    let min = form.getFieldValue('minAge');
    if (min != null || value != null) {
      min = parseInt(min, 10) / 12;
      const maxvalueage = parseInt(value, 10) / 12;

      if (maxvalueage < min) {
        return Promise.reject(new Error('The minimum age cannot be greater than maximum age'));
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
      title="Edit Demography"
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          genderMandatory: data.genderMandatory,
          genderType: data.gender,
          ageMandatory: data.ageMandatory,
          minAge: data.minAge,
          maxAge: data.maxAge,

        }}
        onFinish={finishHandler}
      >
        <Row>
          <Col xs={{ span: 24 }} md={{ span: 16 }}>
            <Form.Item
              name="genderMandatory"
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
                onChange={(e): void => {
                  if (e.target.checked) {
                    // store.candidateRequirement
                    //   .candidateInfo.updateGenderMandatory(e.target.checked);
                  } else {
                    // store.candidateRequirement.candidateInfo.updateGenderMandatory(false);
                  }
                }}
              >
                <span className="mandatory-text">Mandatory</span>
              </Checkbox>
            </Form.Item>

            {/* Gender Preference */}
            <Form.Item
              label="Gender Preferred for the job:"
              name="genderType"
              style={{ marginBottom: 36 }}
            >
              <Radio.Group
                className="radio-buttons"
              >
                <Col style={{ width: '310px' }}>
                  <Radio.Button value="D">{constants.NP}</Radio.Button>
                  <Radio.Button value="M">{constants.M}</Radio.Button>
                  <Radio.Button value="F">{constants.F}</Radio.Button>
                </Col>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={{ span: 24 }} md={{ span: 16 }}>
            <Form.Item
              name="ageMandatory"
              valuePropName="checked"
              style={{
                position: 'absolute',

                top: -14,
                zIndex: 1,
              }}
              className={isMobile ? 'jobdetails-m-mandatory-edit-modal' : 'jobdetails-mandatory-edit-modal '}
            >
              <Checkbox
                value
                className="mandatory-checkbox"
                onChange={(e): void => {
                  if (e.target.checked) {
                    // store.candidateRequirement.
                    // candidateInfo.updateAgeMandatory(e.target.checked);
                  } else {
                    // store.candidateRequirement.candidateInfo.updateAgeMandatory(false);
                  }
                }}
              >
                <span className="mandatory-text">Mandatory</span>
              </Checkbox>
            </Form.Item>

            {/* Age Preference */}
            <Form.Item label="Age of Candidate:" name="age" style={{ marginBottom: 100 }}>
              <Row style={{ width: '350px' }}>
                <Col className={isMobile ? 'jobdetails-m-col-width ' : 'jobdetails-col-width '}>
                  <Form.Item name="minAge" noStyle>
                    <Select
                      className="text-base"
                      placeholder="Minimum Age"
                    >
                      {
                        agearr.map((minagevalue) => (
                          <Option value={minagevalue} key={minagevalue}>
                            {minagevalue}
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

                <Col className={isMobile ? 'jobdetails-m-col-width ' : 'jobdetails-col-width '}>
                  <Form.Item
                    name="maxAge"
                    noStyle
                    rules={[
                      { validator: checkAge }]}
                  >
                    <Select
                      placeholder="Maximum Age"
                      className="text-base"

                    >
                      {
                        agearr.map((maxagevalue) => (
                          <Option
                            value={maxagevalue}
                            key={maxagevalue}
                          >
                            {maxagevalue}
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
                loading={submitInProgress}
                onClick={(): void => {
                  pushClevertapEvent('Candidate Requirement Save', { Type: 'Demography' });
                }}
              >
                Save Changes

              </Button>
            </Form.Item>
          ) }
      </Form>
    </Modal>
  );
};
export default JobDemography;
