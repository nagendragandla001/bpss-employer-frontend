import React, { useState } from 'react';
import {
  Modal, Form, Col, Button, Row, Input,
} from 'antd';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
// import JobPostingGuidelines from 'components/Guidelines/JobPostingGuide';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import { isMobile } from 'mobile-device-detect';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import dynamic from 'next/dynamic';

const JobPostingGuidelines = dynamic(() => import('components/Guidelines/JobPostingGuide'), { ssr: false });

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType
  patchrequest:(string)=>void,
}
const JobOwnership = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [profainword, setprofainword] = useState([]) as any;
  const [form] = Form.useForm();

  const uniqueProfainWords = [] as Array<string>;
  const formdataReq = (reqdata) => {
    // eslint-disable-next-line camelcase
    const otherreq = [] as Array<{text: string; is_required: boolean; has_profain_words: boolean}>;
    for (let i = 0; i < reqdata.length; i += 1) {
      if (reqdata[i] !== '') {
        otherreq.push(
          {
            text: reqdata[i],
            is_required: true,
            has_profain_words: false,
          },
        );
      }
    }
    return otherreq;
  };
  const checkprofain = (response, reqs): void => {
    // eslint-disable-next-line camelcase
    const otherreq = [] as Array<{text: string; is_required: boolean; has_profain_words: boolean}>;

    for (let i = 0; i < reqs.length; i += 1) {
      if (reqs[i] !== '') {
        otherreq.push({
          text: reqs[i],
          is_required: false,
          has_profain_words: false,
        });
      }
    }

    const flags = [];

    if (response) {
      for (let i = 0; i < response?.expectation?.misc_requirements.length; i += 1) {
        for (let j = 0; j < response?.expectation?.misc_requirements[i]?.text.length; j += 1) {
          if (!flags[response?.expectation?.misc_requirements[i]?.text[j]]) {
            uniqueProfainWords.push(response?.expectation?.misc_requirements[i]?.text[j]);
          }
        }
      }
    }
    // console.log(flags, uniqueProfainWords);
    for (let k = 0; k < otherreq.length; k += 1) {
      for (let z = 0; z < uniqueProfainWords.length; z += 1) {
        if (otherreq[k].text.indexOf(uniqueProfainWords[z]) !== -1) {
          otherreq[k].has_profain_words = true;
          if (otherreq[k].has_profain_words === true) {
            const temp = [...profainword];
            temp[k] = true;
            setprofainword(temp);
          }
        }
      }
    }
  };

  const finishHandler = async (formData):Promise<void> => {
    // console.log(formData);
    setSubmitInProgress(true);
    if (formData.additionalRequirements) {
      const obj = {
        expectation: {
          misc_requirements: formdataReq(formData.additionalRequirements) || [],
        },
      };
      const apiCall = await patchJobChanges(data.id, obj);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        patchrequest('success');
        onCancel();
      } else {
        setSubmitInProgress(false);

        const response = await apiCall.data;
        checkprofain(response, formData.additionalRequirements);
      }
    } else {
      setSubmitInProgress(false);
    }
  };
  const [visiblereq, setVisible] = useState(data.miscRequirements.length > 0);
  const [reqList, setreqList] = useState(data.miscRequirements);
  const remReqList = (index):void => {
    const remReq = [...reqList];
    remReq.splice(index, 1);
    setreqList(remReq);
  };

  const addReqList = ():void => {
    const addReq = [...reqList];
    addReq[reqList.length] = '';
    setreqList(addReq);
    // form.setFieldsValue({ additionalRequirements: addReq });
  };

  const addFields = (count, add): Array<{name: number; key: number; fieldKey: number}> => {
    const fields: Array<{name: number; key: number; fieldKey: number}> = [];
    for (let i = 0; i < count; i += 1) {
      const field = {
        name: i,
        key: i,
        fieldKey: i,
      };
      fields.push(field);
      add();
    }
    return fields;
  };

  return (
    <Modal
      visible={!!visible}
      footer={null}
      onCancel={onCancel}
      width={400}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      title="Edit Additional Requirements"
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          additionalRequirements: data.miscRequirements,

        }}
        onFinish={finishHandler}
      >
        <Row gutter={24}>
          {
            (visiblereq) ? (
              <Col span={24} className="d-jp-requirements-section">
                <Row>
                  <Col
                    xs={{ span: 20 }}
                    md={{ span: 20 }}
                    style={{ marginBottom: 20 }}
                    className="text-bold"
                  >
                    Additonal Requirements
                  </Col>
                  <Col
                    xs={{ span: 4 }}
                    md={{ span: 4 }}
                    className="text-right"
                  >
                    <Button
                      size="small"
                      type="link"
                      icon={<CustomImage src="/svgs/m-delete.svg" height={24} width={24} alt="Remove Bike Docs" />}
                      onClick={(): void => {
                        setVisible(false);
                      }}
                      className="p-all-0 auto-size"
                    />
                  </Col>
                  <Col span={24} style={{ marginBottom: 8 }}>
                    Please enter one requirement per box
                  </Col>
                  <Col span={24}>
                    <Form.List name="additionalRequirements">
                      {(fields, { add, remove }): JSX.Element => {
                        if (fields.length === 0
                && reqList.length > 0) {
                          // eslint-disable-next-line no-param-reassign
                          fields = addFields(reqList.length, add);
                        }
                        return (
                          <>
                            {
                              fields.map((field) => (
                                <Col span={20} key={Math.random()}>
                                  <Form.Item
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...field}
                                    key={`type${field.name}`}
                                    name={field.name}
                                    extra={
                                      profainword[field.name] ? (
                                        <>
                                          Your Job posting doesn’t meet
                                          our job posting rules. Click here
                                          {' '}
                                          <JobPostingGuidelines />
                                        </>
                                      ) : null
                                    }
                                    rules={[{ required: true, message: 'Please enter requirement' }]}
                                  >
                                    <Row>

                                      <Col xs={{ span: 21 }} lg={{ span: 22 }}>

                                        <Input
                                          size="large"
                                          placeholder="e.g. Candidate must pay"
                                          className="text-base"
                                          defaultValue={
                                            reqList[field.name] ? reqList[field.name] : ''
                                          }
                                          onBlur={(e): void => {
                                            const reqCopy = [...reqList];
                                            if (e.target.value) {
                                              reqCopy[field.name] = e.target.value;
                                            }
                                            setreqList(reqCopy);
                                          }}
                                        />
                                      </Col>
                                      <Col xs={{ span: 3 }} md={{ span: 2 }} className="text-center">
                                        <Button
                                          type="link"
                                          className="p-all-0"
                                          icon={<CustomImage src="/svgs/row-delete.svg" height={48} width={48} alt="Row Delete" />}
                                          onClick={(): void => {
                                            // store.removeOtherField(field.name);
                                            remove(field.name);
                                            remReqList(field.name);
                                          }}
                                        />
                                      </Col>

                                    </Row>
                                  </Form.Item>
                                </Col>
                              ))
                            }

                            {/* Additional Requirements CTA */}
                            <Form.Item style={{ marginTop: 30 }}>
                              <Button
                                type="link"
                                size="middle"
                                className="text-semibold p-all-0"
                                onClick={(): void => {
                                  add();
                                  addReqList();
                                  // store.addOtherField();
                                }}
                              >
                                + Add another requirement
                              </Button>
                            </Form.Item>
                          </>
                        );
                      }}
                    </Form.List>
                  </Col>
                </Row>
              </Col>
            ) : (
              <Col span={24}>
                <Button
                  type="default"
                  size="middle"
                  className="d-jp-requirements-btn"
                  onClick={(): void => {
                    setVisible(true);
                    addReqList();
                  }}

                >
                  <Row>
                    <Col span={3}>
                      <CustomImage
                        className="d-jp-requirements-img"
                        src="/images/jobpost-form/add-req/bike-req.svg"
                        alt="Add Language Requirement"
                        width={20}
                        height={12}
                      />
                    </Col>
                    <Col span={20}>
                      <span className="d-jp-requirements-text">
                        Add Additional Requirements
                      </span>

                    </Col>
                    <Col span={1}>
                      <span className="d-jp-requirements-add">+</span>
                    </Col>
                  </Row>

                </Button>
              </Col>
            )
          }
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
                  pushClevertapEvent('Candidate Requirement Save', { Type: 'Additional Requirement' });
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
export default JobOwnership;
