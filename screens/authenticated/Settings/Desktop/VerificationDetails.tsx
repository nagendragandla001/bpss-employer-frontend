/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Col, Divider, Form, Popover, Row, Space, Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { tooltipMessage } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import { patchOrgDetails } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';
import CategorySettings from '../Common/CategorySettings';
import GSTSettings from '../Common/GSTSettings';
import PanSettings from '../Common/PanSettings';
import RegisteredNameSettings from '../Common/RegisteredNameSettings';
import { SettingsStateI } from '../Common/settingsPageUtils';

const { Text } = Typography;

interface VerificationdetailsProps {
  state: SettingsStateI;
  dispatch: (et) => void;
}

const ORG_TYPES_DICT = {
  SME: 'Company',
  HR: 'Recruitment Agency',
  IND: 'Freelancer',
};

const VerificationDetails = (props: VerificationdetailsProps): JSX.Element => {
  const { dispatch, state } = props;

  const [form] = Form.useForm();
  const [toggleState, setToggleState] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);

  const type = Form.useWatch('type', form);

  const onEditDetails = (): void => {
    setToggleState(true);
  };

  const onResetForm = (): void => {
    pushClevertapEvent('Verify Org', {
      Type: 'cancel',
      category: state?.type,
      emailVerified: state?.emailVerified,
      'KYC Status': state?.verificationInfo?.status,
      error: 'NA',
    });
    setToggleState(false);
  };

  useEffect(() => {
    if (state?.verificationInfo?.status === 'P_D') {
      setToggleState(true);
    }
  }, [state?.verificationInfo?.status]);

  const onFormError = (errors): void => {
    pushClevertapEvent('Verify Org', {
      Type: 'Submit',
      Status: 'F',
      Error: errors?.errorFields?.[0]?.errors?.[0],
    });
  };

  const onFinishHandler = async (formData): Promise<void> => {
    pushClevertapEvent('Verify Org', {
      Type: 'submit',
      category: state?.type,
      emailVerified: state?.emailVerified,
      'KYC Status': state?.verificationInfo?.status,
      error: 'NA',
    });
    const response = await patchOrgDetails({ ...formData }, state?.orgId);
    if ([200, 201, 202].includes(response?.status)) {
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          type: formData?.type,
          website: formData?.type,
          verificationInfo: {
            ...response?.data?._source?.verification_info,
          },
        },
      });
      setToggleState(false);
    }
  };

  const onValuesChange = (): void => {
    if (!isFormFilled) {
      pushClevertapEvent('Verify Org', {
        Type: 'start',
        category: ORG_TYPES_DICT?.[state?.type],
        emailVerified: state?.emailVerified,
        'KYC Status': state?.verificationInfo?.status,
      });
      setIsFormFilled(true);
    }
  };

  return (
    <Row gutter={[0, 8]}>
      <Col span={24}>
        <Row justify="space-between">
          <Col>
            <Space>
              <Text className="label-header main-header-label">Verification details</Text>
              <Popover content={tooltipMessage(state?.type)}>
                <InfoCircleOutlined />
              </Popover>
            </Space>
          </Col>
          {
            ['P', 'F'].includes(state?.verificationInfo?.status) && (
              <Col>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={onEditDetails}
                  className="p-all-0 auto-size text-bold text-small text-warn edit-details"
                >
                  Edit Details
                </Button>
              </Col>
            )
          }
        </Row>
      </Col>
      <Col span={24}>
        <Row className="setting-container">
          <Col span={24}>
            <Form
              name="verification-details"
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinishFailed={onFormError}
              onFinish={onFinishHandler}
              onValuesChange={onValuesChange}
              initialValues={{
                type: state?.type,
                registered_company_name: state?.verificationInfo?.registered_company_name?.value,
                pan_verification: state?.verificationInfo?.pan_verification?.value,
                gst_verification: state?.verificationInfo?.gst_verification?.value,
              }}
            >
              <CategorySettings
                state={state}
                toggleState={toggleState}
                dispatch={dispatch}
              />
              <Divider style={{ margin: 0 }} />
              <RegisteredNameSettings
                state={state}
                toggleState={toggleState}
              />
              {
                (state?.type === 'IND' || type === 'IND') ? (
                  <>
                    <Divider style={{ margin: 0 }} />
                    <PanSettings
                      state={state}
                      toggleState={toggleState}
                    />
                  </>
                ) : (
                  <>
                    <Divider style={{ margin: 0 }} />
                    <GSTSettings
                      state={state}
                      toggleState={toggleState}
                    />
                  </>
                )
              }
              {
                toggleState && (
                  <>
                    <Divider style={{ margin: 0 }} />
                    <Row className="p-all-16">
                      <Col span={24}>
                        <Form.Item style={{ marginBottom: 0 }}>
                          <Space>
                            <Button
                              size="small"
                              type="primary"
                              htmlType="submit"
                            >
                              Save

                            </Button>
                            {
                              ['P', 'F'].includes(state?.verificationInfo?.status) && (
                                <Button
                                  size="small"
                                  type="link"
                                  htmlType="button"
                                  onClick={onResetForm}
                                >
                                  Cancel
                                </Button>
                              )
                            }
                          </Space>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )
              }
            </Form>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default VerificationDetails;
