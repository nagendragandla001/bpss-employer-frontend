import React, { useState } from 'react';
import {
  Form, Row, Radio, Typography, Col, Button,
} from 'antd';
import { getAddressIndex } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { FormInstance } from 'antd/lib/form';
import dynamic from 'next/dynamic';
import CustomImage from 'components/Wrappers/CustomImage';

const MobileNewAddressModal = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/MobileNewAddressModal'), { ssr: false });

const { Paragraph } = Typography;

interface PropsModel {
  form: FormInstance
  SelectedInterviewAddress: number;
  InterviewLocations: Array<any>;
  onThirdScreenFinishHandler: (data) => void;
  onChangeHandlerAddress: (e) => void;
  loading:boolean
}

const InterviewAddress = (props: PropsModel): JSX.Element => {
  const {
    form, onThirdScreenFinishHandler,
    SelectedInterviewAddress, InterviewLocations, onChangeHandlerAddress, loading,
  } = props;

  const [state, setState] = useState({
    ShowInterviewModal: InterviewLocations.length === 0,
  });
  // if (InterviewLocations.length === 0) { state.ShowInterviewModal = true; }
  return (
    <Form
      style={{
        display: 'block',
        // height: '480px',
        overflowY: 'scroll',
      }}
      form={form}
      onFinish={onThirdScreenFinishHandler}
      initialValues={{
        InterviewAddress: SelectedInterviewAddress,
      }}
    >
      <Row>

        <Form.Item
          label={InterviewLocations.length === 0 ? '' : 'Added interview addresses:'}
          name="InterviewAddress"
          rules={[{
            required: true,
            message: 'Interview address is required',
          }]}
          validateTrigger={['onBlur']}
          style={{ marginBottom: 15, minHeight: 25 }}
        >
          {InterviewLocations.length > 0 ? (
            <Radio.Group
              className={state.ShowInterviewModal ? 'disabled-checkbox' : 'repeat-slots-checkbox'}
              onChange={onChangeHandlerAddress}
              value={SelectedInterviewAddress}
              disabled={state.ShowInterviewModal}
              style={{ display: 'flex' }}
            >
              <Row style={{
                display: 'block',
                height: '160px',
                overflowY: 'scroll',
              }}
              >
                {InterviewLocations.map((item) => (

                  <div key={item.id}>
                    <Radio
                      value={item.id}
                      className={state.ShowInterviewModal ? '' : 'radio-suggest'}
                      disabled={state.ShowInterviewModal}
                      style={{ display: 'flex' }}
                    >
                      <Paragraph className="checkbox-content">
                        <Row style={{ display: 'flex-root' }} align="top">
                          <Col
                            span={8}
                            style={{
                              width: '600px',
                              whiteSpace: 'initial',
                            }}
                          >
                            <span className={state.ShowInterviewModal ? 'disabled-text' : ''}>
                              {' '}
                              {item.address}
                            </span>
                          </Col>

                          <Col span={8}>
                            <a
                              href={item.mapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#7e8085' }}
                              className="text-small"
                            >

                              <CustomImage
                                src={`/images/application-tab/address${getAddressIndex(item.id.toString())}.jpg`}
                                alt="icon"
                                height={48}
                                width={48}
                                className="address-image"
                              />

                            </a>
                          </Col>

                        </Row>
                        <div className="page-0-btn-divider title-divider" />
                      </Paragraph>
                    </Radio>
                  </div>

                ))}
              </Row>

            </Radio.Group>
          )
            : (
              <MobileNewAddressModal
                interviewModal={state.ShowInterviewModal}
                CloseModal={(): void => setState(
                  (prevState) => ({ ...prevState, ShowInterviewModal: false }),
                )}
                changeState={setState}
                FinishHandlerForm={onThirdScreenFinishHandler}
                interviewLocationsList={InterviewLocations}
                parentForm={form}
              />
            )}
        </Form.Item>

        {state.ShowInterviewModal
          ? (
            <MobileNewAddressModal
              interviewModal={state.ShowInterviewModal}
              CloseModal={(): void => setState(
                (prevState) => ({ ...prevState, ShowInterviewModal: false }),
              )}
              changeState={setState}
              FinishHandlerForm={onThirdScreenFinishHandler}
              interviewLocationsList={InterviewLocations}
              parentForm={form}

            />

          )
          : (
            <Col span={24}>
              <Button
                type="link"
                onClick={(): void => setState(
                  (prevState) => ({ ...prevState, ShowInterviewModal: true }),
                )}
                className="text-base text-semibold"
                style={{ marginBottom: 40 }}
              >
                + Add Another Address
              </Button>
            </Col>

          )}
      </Row>
      {!state.ShowInterviewModal
        ? (
          <Button
            type="primary"
            htmlType="submit"
            block
            className="interview-btn"
            loading={loading}
          >
            Send Invite
          </Button>
        ) : ''}
    </Form>
  );
};

export default InterviewAddress;
